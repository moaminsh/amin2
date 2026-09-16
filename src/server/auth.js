import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { logAuditEvent } from './audit.js';

// Configuration constants
const SESSION_COOKIE_NAME = 'fluidmind_admin_sid';
const CSRF_COOKIE_NAME = 'fluidmind_csrf';
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 hours
const IDLE_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes idle timeout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Hash raw session token using SHA-256 for secure database storage
 */
export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Password verification using bcrypt
 */
export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Password hashing using bcrypt with cost 12
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Creates an authenticated session in the database and returns token
 */
export function createSession(userId, req) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const sessionId = 'ses_' + crypto.randomUUID().replace(/-/g, '');
  const ip = req?.headers['x-forwarded-for']?.split(',')[0]?.trim() || req?.socket?.remoteAddress || '127.0.0.1';
  const userAgent = (req?.headers['user-agent'] || 'unknown').substring(0, 255);
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at, last_active_at, is_revoked)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);
  `).run(sessionId, userId, tokenHash, ip, userAgent, expiresAt);

  return { rawToken, sessionId, expiresAt };
}

/**
 * Attaches secure session and CSRF cookies to response
 */
export function setAuthCookies(res, rawSessionToken, req) {
  const isSecure = process.env.NODE_ENV === 'production' || req?.secure;

  res.cookie(SESSION_COOKIE_NAME, rawSessionToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_LIFETIME_MS
  });

  // CSRF token in accessible cookie for Double Submit Cookie pattern
  const csrfToken = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Read by frontend JS to set X-CSRF-Token header
    secure: isSecure,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_LIFETIME_MS
  });

  return csrfToken;
}

/**
 * Clear authentication cookies on logout
 */
export function clearAuthCookies(res) {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
}

/**
 * Fetch full user context including roles and distinct permissions
 */
export function getUserWithPrivileges(userId) {
  const user = db.prepare(`
    SELECT id, email, full_name, is_active, requires_password_change, failed_attempts, locked_until, created_at
    FROM users WHERE id = ?
  `).get(userId);

  if (!user) return null;

  // Retrieve roles
  const roles = db.prepare(`
    SELECT r.id, r.name
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = ?
  `).all(userId).map(r => r.name);

  // Retrieve granular permissions
  const permissions = db.prepare(`
    SELECT DISTINCT p.name
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = ?
  `).all(userId).map(p => p.name);

  // Check MFA status
  const mfa = db.prepare(`
    SELECT is_enabled FROM mfa_credentials WHERE user_id = ?
  `).get(userId);

  return {
    ...user,
    roles,
    permissions,
    is_mfa_enabled: Boolean(mfa?.is_enabled)
  };
}

/**
 * Session Authentication Middleware
 */
export function authenticateSession(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE_NAME] || req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Valid authentication session required.'
    });
  }

  const tokenHash = hashToken(token);
  const session = db.prepare(`
    SELECT * FROM sessions WHERE token_hash = ? AND is_revoked = 0
  `).get(tokenHash);

  if (!session) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      error: 'INVALID_SESSION',
      message: 'Session is invalid or has been revoked.'
    });
  }

  // Check absolute expiration
  const now = Date.now();
  if (new Date(session.expires_at).getTime() < now) {
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE id = ?').run(session.id);
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      error: 'SESSION_EXPIRED',
      message: 'Session has expired. Please sign in again.'
    });
  }

  // Check idle timeout
  const lastActiveTime = new Date(session.last_active_at).getTime();
  if (now - lastActiveTime > IDLE_TIMEOUT_MS) {
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE id = ?').run(session.id);
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      error: 'SESSION_IDLE_TIMEOUT',
      message: 'Session timed out due to inactivity.'
    });
  }

  // Refresh last_active_at
  db.prepare(`UPDATE sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?`).run(session.id);

  // Retrieve user with privileges
  const user = getUserWithPrivileges(session.user_id);
  if (!user || !user.is_active) {
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE id = ?').run(session.id);
    clearAuthCookies(res);
    return res.status(403).json({
      success: false,
      error: 'ACCOUNT_DISABLED',
      message: 'This user account is inactive or disabled.'
    });
  }

  req.user = user;
  req.session = session;
  next();
}

/**
 * CSRF Validation Middleware for state-mutating requests
 */
export function validateCSRF(req, res, next) {
  // Safe methods do not require CSRF token
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'] || req.body?._csrf;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logAuditEvent(req, {
      userId: req.user?.id || null,
      action: 'CSRF_BLOCKED',
      resource: req.originalUrl,
      details: 'Mismatched or missing CSRF token',
      result: 'FAILURE'
    });
    return res.status(403).json({
      success: false,
      error: 'CSRF_VERIFICATION_FAILED',
      message: 'Cross-Site Request Forgery (CSRF) token verification failed.'
    });
  }

  next();
}

/**
 * Require Specific Granular Permission Middleware
 */
export function requirePermission(permissionName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    // Super Admin role has blanket authorization
    if (req.user.roles.includes('Super Admin')) {
      return next();
    }

    if (!req.user.permissions.includes(permissionName)) {
      logAuditEvent(req, {
        userId: req.user.id,
        action: 'ACCESS_DENIED',
        resource: req.originalUrl,
        details: `Missing required permission: ${permissionName}`,
        result: 'FAILURE'
      });
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_PERMISSION',
        message: `You do not have the required permission (${permissionName}) to perform this action.`
      });
    }

    next();
  };
}

/**
 * Require Specific Role Middleware
 */
export function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }
    if (!req.user.roles.includes(roleName) && !req.user.roles.includes('Super Admin')) {
      logAuditEvent(req, {
        userId: req.user.id,
        action: 'ACCESS_DENIED',
        resource: req.originalUrl,
        details: `Missing required role: ${roleName}`,
        result: 'FAILURE'
      });
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_ROLE',
        message: `Action requires role: ${roleName}`
      });
    }
    next();
  };
}

/**
 * Handle Failed Login Attempt with Progressive Lockout
 */
export function recordFailedLogin(user, req) {
  if (!user) return;

  const newAttempts = (user.failed_attempts || 0) + 1;
  let lockedUntil = null;

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
  }

  db.prepare(`
    UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?
  `).run(newAttempts, lockedUntil, user.id);

  logAuditEvent(req, {
    userId: user.id,
    action: 'AUTH_LOGIN_FAILED',
    resource: 'auth/login',
    details: `Consecutive failed attempts: ${newAttempts}. Locked: ${Boolean(lockedUntil)}`,
    result: 'FAILURE'
  });

  return { attempts: newAttempts, isLocked: Boolean(lockedUntil) };
}

/**
 * Reset Failed Attempts upon Successful Authentication
 */
export function resetFailedAttempts(userId) {
  db.prepare(`
    UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?
  `).run(userId);
}
