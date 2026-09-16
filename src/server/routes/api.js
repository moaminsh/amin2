import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { generateSecret, generateURI, verifySync } from 'otplib';
import qrcode from 'qrcode';
import { db } from '../db.js';
import {
  authenticateSession,
  requirePermission,
  requireRole,
  validateCSRF,
  verifyPassword,
  hashPassword,
  createSession,
  setAuthCookies,
  clearAuthCookies,
  recordFailedLogin,
  resetFailedAttempts,
  getUserWithPrivileges,
  hashToken
} from '../auth.js';
import { logAuditEvent, getAuditLogs } from '../audit.js';
import {
  UPLOAD_DIR,
  sanitizeFilename,
  validateMagicBytes,
  sanitizeSVG,
  resolveSafePath
} from '../fileSecurity.js';

export const apiRouter = express.Router();

// Setup in-memory multer for upload verification before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
    files: 1
  }
});

// ============================================================================
// 1. PUBLIC API ENDPOINTS
// ============================================================================

/**
 * Public Content Hydration API (Read-Only)
 * Allows index.html and public modules to load dynamic CMS content
 */
apiRouter.get('/content/public', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT section, content_key, value_fa, value_en, content_type
      FROM content
      WHERE status = 'published' AND is_deleted = 0
    `).all();

    const structured = {};
    for (const row of rows) {
      if (!structured[row.section]) {
        structured[row.section] = {};
      }
      structured[row.section][row.content_key] = {
        fa: row.value_fa,
        en: row.value_en,
        type: row.content_type
      };
    }

    res.json({ success: true, data: structured });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR' });
  }
});

/**
 * Public File Access Endpoint (Only for non-private uploaded assets)
 */
apiRouter.get('/files/:storedName', (req, res) => {
  try {
    const { storedName } = req.params;
    const fileRecord = db.prepare(`
      SELECT * FROM files WHERE stored_name = ? AND is_deleted = 0
    `).get(storedName);

    if (!fileRecord || fileRecord.is_private) {
      return res.status(404).json({ success: false, error: 'FILE_NOT_FOUND_OR_PRIVATE' });
    }

    const safePath = resolveSafePath(fileRecord.stored_name);
    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ success: false, error: 'FILE_MISSING_ON_DISK' });
    }

    // Set secure delivery headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', fileRecord.mime_type || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(safePath);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2. ADMIN AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Admin Login
 */
apiRouter.post('/admin/auth/login', async (req, res) => {
  const { email, password, mfaToken } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_CREDENTIALS',
      message: 'Email and password are required.'
    });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

  if (!user) {
    logAuditEvent(req, {
      action: 'AUTH_LOGIN_FAILED',
      resource: 'auth/login',
      details: `Unknown account attempt: ${normalizedEmail}`,
      result: 'FAILURE'
    });
    return res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials provided.'
    });
  }

  // Check Account Lockout
  if (user.locked_until) {
    const lockTime = new Date(user.locked_until).getTime();
    if (Date.now() < lockTime) {
      const remainingMinutes = Math.ceil((lockTime - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to multiple failed attempts. Try again in ${remainingMinutes} minute(s).`
      });
    } else {
      // Lock expired, clear lock
      resetFailedAttempts(user.id);
    }
  }

  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      error: 'ACCOUNT_DISABLED',
      message: 'Account is disabled. Contact system super administrator.'
    });
  }

  // Password verification
  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    const lockoutState = recordFailedLogin(user, req);
    const attemptsLeft = Math.max(0, 5 - lockoutState.attempts);
    return res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: lockoutState.isLocked
        ? 'Account has been locked for 15 minutes due to too many failed attempts.'
        : `Invalid credentials. Attempts remaining before lockout: ${attemptsLeft}`
    });
  }

  // Check MFA
  const mfa = db.prepare('SELECT * FROM mfa_credentials WHERE user_id = ? AND is_enabled = 1').get(user.id);
  if (mfa) {
    if (!mfaToken) {
      return res.status(200).json({
        success: true,
        requiresMfa: true,
        message: 'Two-factor authentication code required.'
      });
    }

    const checkRes = verifySync({ token: mfaToken.trim(), secret: mfa.secret });
    const isValidMfa = checkRes && checkRes.valid;
    let usedBackup = false;

    if (!isValidMfa && mfa.backup_codes) {
      const codes = JSON.parse(mfa.backup_codes);
      const codeIndex = codes.indexOf(mfaToken.trim());
      if (codeIndex !== -1) {
        usedBackup = true;
        codes.splice(codeIndex, 1);
        db.prepare('UPDATE mfa_credentials SET backup_codes = ? WHERE id = ?').run(JSON.stringify(codes), mfa.id);
      }
    }

    if (!isValidMfa && !usedBackup) {
      recordFailedLogin(user, req);
      return res.status(401).json({
        success: false,
        error: 'INVALID_MFA_TOKEN',
        message: 'Invalid 2FA authentication code.'
      });
    }
  }

  // Successful Login
  resetFailedAttempts(user.id);
  const session = createSession(user.id, req);
  const csrfToken = setAuthCookies(res, session.rawToken, req);

  logAuditEvent(req, {
    userId: user.id,
    action: 'AUTH_LOGIN_SUCCESS',
    resource: 'auth/login',
    details: 'User authenticated successfully',
    result: 'SUCCESS'
  });

  const fullUser = getUserWithPrivileges(user.id);

  res.json({
    success: true,
    user: fullUser,
    token: session.rawToken,
    csrfToken,
    requiresPasswordChange: Boolean(user.requires_password_change)
  });
});

/**
 * Logout
 */
apiRouter.post('/admin/auth/logout', authenticateSession, (req, res) => {
  if (req.session?.id) {
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE id = ?').run(req.session.id);
  }
  clearAuthCookies(res);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'AUTH_LOGOUT',
    resource: 'auth/logout',
    details: 'User logged out',
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * Current Session Profile
 */
apiRouter.get('/admin/auth/me', authenticateSession, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    session: {
      id: req.session.id,
      expiresAt: req.session.expires_at,
      lastActiveAt: req.session.last_active_at
    }
  });
});

/**
 * Change Password (Mandatory on First Login or On-Demand)
 */
apiRouter.post('/admin/auth/change-password', authenticateSession, validateCSRF, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'MISSING_FIELDS' });
  }

  // Validate strong password: >= 8 characters, letters, digits, symbols
  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      error: 'WEAK_PASSWORD',
      message: 'New password must contain at least 8 characters, including uppercase, lowercase, and numbers.'
    });
  }

  const currentUser = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  const isMatch = await verifyPassword(currentPassword, currentUser.password_hash);
  if (!isMatch) {
    logAuditEvent(req, {
      userId: req.user.id,
      action: 'PASSWORD_CHANGE_FAILED',
      resource: 'auth/change-password',
      details: 'Current password mismatch',
      result: 'FAILURE'
    });
    return res.status(401).json({ success: false, error: 'CURRENT_PASSWORD_INCORRECT' });
  }

  const newHash = await hashPassword(newPassword);
  db.prepare(`
    UPDATE users
    SET password_hash = ?, requires_password_change = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newHash, req.user.id);

  // Revoke all other active sessions for security
  db.prepare(`
    UPDATE sessions SET is_revoked = 1 WHERE user_id = ? AND id != ?
  `).run(req.user.id, req.session.id);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'PASSWORD_CHANGE_SUCCESS',
    resource: 'auth/change-password',
    details: 'Password updated; other sessions terminated',
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'Password updated successfully.' });
});

/**
 * MFA / 2FA Setup
 */
apiRouter.post('/admin/auth/mfa/setup', authenticateSession, validateCSRF, async (req, res) => {
  const secret = generateSecret();
  const otpauth = generateURI({
    issuer: 'FluidMind Portal',
    label: req.user.email,
    secret
  });
  const qrCodeDataUrl = await qrcode.toDataURL(otpauth);

  // Store or update temporary secret in mfa_credentials
  db.prepare(`
    INSERT INTO mfa_credentials (id, user_id, secret, is_enabled, backup_codes)
    VALUES (?, ?, ?, 0, NULL)
    ON CONFLICT(user_id) DO UPDATE SET secret = excluded.secret;
  `).run('mfa_' + crypto.randomUUID().slice(0, 16), req.user.id, secret);

  res.json({
    success: true,
    secret,
    qrCode: qrCodeDataUrl
  });
});

/**
 * MFA / 2FA Verify and Enable
 */
apiRouter.post('/admin/auth/mfa/verify', authenticateSession, validateCSRF, (req, res) => {
  const { token } = req.body || {};
  const mfa = db.prepare('SELECT * FROM mfa_credentials WHERE user_id = ?').get(req.user.id);

  if (!mfa || !token) {
    return res.status(400).json({ success: false, error: 'MFA_NOT_INITIALIZED' });
  }

  const checkRes = verifySync({ token: token.trim(), secret: mfa.secret });
  const isValid = checkRes && checkRes.valid;
  if (!isValid) {
    return res.status(400).json({ success: false, error: 'INVALID_MFA_CODE' });
  }

  // Generate 8 random one-time backup codes
  const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

  db.prepare(`
    UPDATE mfa_credentials
    SET is_enabled = 1, backup_codes = ?, verified_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(JSON.stringify(backupCodes), req.user.id);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'MFA_ENABLED',
    resource: 'auth/mfa',
    details: 'Two-factor authentication enabled with backup codes generated',
    result: 'SUCCESS'
  });

  res.json({
    success: true,
    backupCodes,
    message: '2FA has been successfully activated.'
  });
});

/**
 * MFA / 2FA Disable
 */
apiRouter.post('/admin/auth/mfa/disable', authenticateSession, validateCSRF, async (req, res) => {
  const { password, token } = req.body || {};
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  const mfa = db.prepare('SELECT * FROM mfa_credentials WHERE user_id = ? AND is_enabled = 1').get(req.user.id);

  if (!mfa) {
    return res.status(400).json({ success: false, error: 'MFA_NOT_ACTIVE' });
  }

  const isPassValid = await verifyPassword(password, user.password_hash);
  const checkRes = verifySync({ token: token.trim(), secret: mfa.secret });
  const isMfaValid = checkRes && checkRes.valid;

  if (!isPassValid || !isMfaValid) {
    return res.status(401).json({ success: false, error: 'VERIFICATION_FAILED' });
  }

  db.prepare('DELETE FROM mfa_credentials WHERE user_id = ?').run(req.user.id);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'MFA_DISABLED',
    resource: 'auth/mfa',
    details: 'Two-factor authentication disabled by user',
    result: 'SUCCESS'
  });

  res.json({ success: true, message: '2FA disabled successfully.' });
});

/**
 * List Active Sessions
 */
apiRouter.get('/admin/auth/sessions', authenticateSession, (req, res) => {
  const sessions = db.prepare(`
    SELECT id, ip_address, user_agent, expires_at, created_at, last_active_at, is_revoked
    FROM sessions
    WHERE user_id = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP
    ORDER BY last_active_at DESC
  `).all(req.user.id);

  const formatted = sessions.map(s => ({
    ...s,
    isCurrent: s.id === req.session.id
  }));

  res.json({ success: true, sessions: formatted });
});

/**
 * Revoke Session
 */
apiRouter.post('/admin/auth/sessions/revoke', authenticateSession, validateCSRF, (req, res) => {
  const { sessionId, revokeOthers } = req.body || {};

  if (revokeOthers) {
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ? AND id != ?').run(req.user.id, req.session.id);
    logAuditEvent(req, {
      userId: req.user.id,
      action: 'SESSIONS_REVOKE_OTHERS',
      resource: 'auth/sessions',
      details: 'Revoked all other active sessions',
      result: 'SUCCESS'
    });
    return res.json({ success: true, message: 'All other active sessions revoked.' });
  }

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'MISSING_SESSION_ID' });
  }

  db.prepare('UPDATE sessions SET is_revoked = 1 WHERE id = ? AND user_id = ?').run(sessionId, req.user.id);
  logAuditEvent(req, {
    userId: req.user.id,
    action: 'SESSION_REVOKED',
    resource: 'auth/sessions',
    details: `Session revoked: ${sessionId}`,
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'Session revoked successfully.' });
});

// ============================================================================
// 3. CONTENT MANAGEMENT ENDPOINTS (RBAC PROTECTED)
// ============================================================================

/**
 * List Content Items
 */
apiRouter.get('/admin/content', authenticateSession, requirePermission('content.read'), (req, res) => {
  const { section, search, status, includeDeleted } = req.query;
  let query = 'SELECT * FROM content WHERE 1=1';
  const params = [];

  if (!includeDeleted) {
    query += ' AND is_deleted = 0';
  }
  if (section) {
    query += ' AND section = ?';
    params.push(section);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (content_key LIKE ? OR value_fa LIKE ? OR value_en LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY section ASC, content_key ASC';
  const items = db.prepare(query).all(...params);

  res.json({ success: true, items });
});

/**
 * Create Content Item
 */
apiRouter.post('/admin/content', authenticateSession, requirePermission('content.create'), validateCSRF, (req, res) => {
  const { section, content_key, value_fa, value_en, content_type = 'text', status = 'published' } = req.body || {};

  if (!section || !content_key) {
    return res.status(400).json({ success: false, error: 'MISSING_REQUIRED_FIELDS' });
  }

  const id = 'cnt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  try {
    db.prepare(`
      INSERT INTO content (id, section, content_key, value_fa, value_en, content_type, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, section.trim(), content_key.trim(), value_fa || '', value_en || '', content_type, status);

    logAuditEvent(req, {
      userId: req.user.id,
      action: 'CONTENT_CREATE',
      resource: `content/${id}`,
      details: `Created content key: ${section}/${content_key}`,
      result: 'SUCCESS'
    });

    res.json({ success: true, id, message: 'Content created successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, error: 'DUPLICATE_KEY_OR_ERROR', message: err.message });
  }
});

/**
 * Update Content Item
 */
apiRouter.put('/admin/content/:id', authenticateSession, requirePermission('content.update'), validateCSRF, (req, res) => {
  const { id } = req.params;
  const { value_fa, value_en, content_type, status } = req.body || {};

  const existing = db.prepare('SELECT * FROM content WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'CONTENT_NOT_FOUND' });
  }

  db.prepare(`
    UPDATE content
    SET value_fa = COALESCE(?, value_fa),
        value_en = COALESCE(?, value_en),
        content_type = COALESCE(?, content_type),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(value_fa, value_en, content_type, status, id);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'CONTENT_UPDATE',
    resource: `content/${id}`,
    details: `Updated ${existing.section}/${existing.content_key} to status: ${status || existing.status}`,
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'Content updated successfully.' });
});

/**
 * Delete Content Item (Soft Delete)
 */
apiRouter.delete('/admin/content/:id', authenticateSession, requirePermission('content.delete'), validateCSRF, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM content WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({ success: false, error: 'CONTENT_NOT_FOUND' });
  }

  db.prepare('UPDATE content SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'CONTENT_SOFT_DELETE',
    resource: `content/${id}`,
    details: `Soft deleted ${existing.section}/${existing.content_key}`,
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'Content item soft-deleted successfully.' });
});

// ============================================================================
// 4. SECURE FILE MANAGER ENDPOINTS (RBAC PROTECTED)
// ============================================================================

/**
 * List Files
 */
apiRouter.get('/admin/files', authenticateSession, requirePermission('files.read'), (req, res) => {
  const { search, extension } = req.query;
  let query = 'SELECT * FROM files WHERE is_deleted = 0';
  const params = [];

  if (extension) {
    query += ' AND extension = ?';
    params.push(extension.toLowerCase());
  }
  if (search) {
    query += ' AND (original_name LIKE ? OR stored_name LIKE ? OR used_in LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY created_at DESC';
  const files = db.prepare(query).all(...params);

  res.json({ success: true, files });
});

/**
 * Secure File Upload
 */
apiRouter.post('/admin/files/upload', authenticateSession, requirePermission('files.upload'), validateCSRF, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'NO_FILE_PROVIDED' });
  }

  try {
    const originalName = req.file.originalname;
    const buffer = req.file.buffer;
    const { ext, storedName } = sanitizeFilename(originalName);

    // Validate binary signatures / Magic Bytes
    if (!validateMagicBytes(buffer, ext)) {
      logAuditEvent(req, {
        userId: req.user.id,
        action: 'FILE_UPLOAD_BLOCKED',
        resource: originalName,
        details: 'Magic bytes validation failed (spoofed extension)',
        result: 'FAILURE'
      });
      return res.status(400).json({
        success: false,
        error: 'MAGIC_BYTES_MISMATCH',
        message: 'File contents do not match the expected file signature.'
      });
    }

    // Sanitize SVG if vector image
    let finalBuffer = buffer;
    if (ext === 'svg') {
      try {
        const sanitizedSvg = sanitizeSVG(buffer.toString('utf-8'));
        finalBuffer = Buffer.from(sanitizedSvg, 'utf-8');
      } catch (svgErr) {
        return res.status(400).json({ success: false, error: 'MALICIOUS_SVG_DETECTED', message: svgErr.message });
      }
    }

    // Write file securely to designated upload folder
    const targetPath = path.join(UPLOAD_DIR, storedName);
    fs.writeFileSync(targetPath, finalBuffer, { mode: 0o644 }); // Non-executable permissions

    const id = 'fil_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const isPrivate = req.body.is_private === 'true' || req.body.is_private === true ? 1 : 0;
    const usedIn = req.body.used_in ? String(req.body.used_in).substring(0, 100) : null;

    db.prepare(`
      INSERT INTO files (id, original_name, stored_name, file_path, mime_type, file_size, extension, is_private, uploaded_by, used_in, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, originalName, storedName, targetPath, req.file.mimetype, finalBuffer.length, ext, isPrivate, req.user.id, usedIn);

    logAuditEvent(req, {
      userId: req.user.id,
      action: 'FILE_UPLOAD_SUCCESS',
      resource: `files/${id}`,
      details: `Uploaded ${originalName} as ${storedName} (${finalBuffer.length} bytes)`,
      result: 'SUCCESS'
    });

    res.json({
      success: true,
      file: {
        id,
        originalName,
        storedName,
        size: finalBuffer.length,
        extension: ext,
        isPrivate,
        url: isPrivate ? `/api/admin/files/download/${id}` : `/api/files/${storedName}`
      }
    });
  } catch (err) {
    logAuditEvent(req, {
      userId: req.user.id,
      action: 'FILE_UPLOAD_ERROR',
      resource: req.file?.originalname,
      details: err.message,
      result: 'FAILURE'
    });
    res.status(400).json({ success: false, error: 'UPLOAD_FAILED', message: err.message });
  }
});

/**
 * Authenticated Private File Download
 */
apiRouter.get('/admin/files/download/:id', authenticateSession, requirePermission('files.read'), (req, res) => {
  const file = db.prepare('SELECT * FROM files WHERE id = ? AND is_deleted = 0').get(req.params.id);

  if (!file) {
    return res.status(404).json({ success: false, error: 'FILE_NOT_FOUND' });
  }

  const safePath = resolveSafePath(file.stored_name);
  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ success: false, error: 'FILE_MISSING_ON_DISK' });
  }

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'FILE_DOWNLOAD',
    resource: `files/${file.id}`,
    details: `Downloaded ${file.original_name}`,
    result: 'SUCCESS'
  });

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
  res.sendFile(safePath);
});

/**
 * Rename or Update File Metadata
 */
apiRouter.put('/admin/files/:id', authenticateSession, requirePermission('files.upload'), validateCSRF, (req, res) => {
  const { id } = req.params;
  const { original_name, used_in, is_private } = req.body || {};

  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id);
  if (!file) {
    return res.status(404).json({ success: false, error: 'FILE_NOT_FOUND' });
  }

  db.prepare(`
    UPDATE files
    SET original_name = COALESCE(?, original_name),
        used_in = COALESCE(?, used_in),
        is_private = COALESCE(?, is_private)
    WHERE id = ?
  `).run(original_name, used_in, is_private !== undefined ? (is_private ? 1 : 0) : null, id);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'FILE_METADATA_UPDATE',
    resource: `files/${id}`,
    details: `Updated file metadata for ${file.original_name}`,
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'File updated successfully.' });
});

/**
 * Delete File (Soft Delete)
 */
apiRouter.delete('/admin/files/:id', authenticateSession, requirePermission('files.delete'), validateCSRF, (req, res) => {
  const { id } = req.params;
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id);

  if (!file) {
    return res.status(404).json({ success: false, error: 'FILE_NOT_FOUND' });
  }

  db.prepare('UPDATE files SET is_deleted = 1 WHERE id = ?').run(id);

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'FILE_SOFT_DELETE',
    resource: `files/${id}`,
    details: `Soft deleted file ${file.original_name}`,
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'File removed from directory.' });
});

// ============================================================================
// 5. USER & ROLE MANAGEMENT (SUPER ADMIN / USERS.MANAGE)
// ============================================================================

/**
 * List Users
 */
apiRouter.get('/admin/users', authenticateSession, requirePermission('users.manage'), (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.email, u.full_name, u.is_active, u.created_at, u.requires_password_change, u.failed_attempts, u.locked_until
    FROM users u
    ORDER BY u.created_at ASC
  `).all();

  const formatted = users.map(u => {
    const roles = db.prepare(`
      SELECT r.id, r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?
    `).all(u.id);
    return { ...u, roles };
  });

  res.json({ success: true, users: formatted });
});

/**
 * Create New User
 */
apiRouter.post('/admin/users', authenticateSession, requirePermission('users.manage'), validateCSRF, async (req, res) => {
  const { email, password, full_name, role_id } = req.body || {};

  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, error: 'MISSING_FIELDS' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(400).json({ success: false, error: 'USER_ALREADY_EXISTS' });
  }

  const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const passwordHash = await hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, is_active, requires_password_change)
    VALUES (?, ?, ?, ?, 1, 1)
  `).run(userId, normalizedEmail, passwordHash, full_name.trim());

  if (role_id) {
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(userId, role_id);
  } else {
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, "role_editor")').run(userId);
  }

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'USER_CREATE',
    resource: `users/${userId}`,
    details: `Created user ${normalizedEmail} with role ${role_id || 'Editor'}`,
    result: 'SUCCESS'
  });

  res.json({ success: true, id: userId, message: 'User created successfully.' });
});

/**
 * Update User Status or Role
 */
apiRouter.put('/admin/users/:id', authenticateSession, requirePermission('users.manage'), validateCSRF, (req, res) => {
  const { id } = req.params;
  const { full_name, is_active, role_id } = req.body || {};

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
  }

  // Prevent self-deactivation of super admin
  if (id === req.user.id && is_active === 0) {
    return res.status(400).json({ success: false, error: 'CANNOT_DEACTIVATE_SELF' });
  }

  if (full_name !== undefined || is_active !== undefined) {
    db.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name, is_active !== undefined ? (is_active ? 1 : 0) : null, id);
  }

  if (role_id) {
    db.prepare('DELETE FROM user_roles WHERE user_id = ?').run(id);
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(id, role_id);
  }

  logAuditEvent(req, {
    userId: req.user.id,
    action: 'USER_UPDATE',
    resource: `users/${id}`,
    details: `Updated user profile/roles for ${user.email}`,
    result: 'SUCCESS'
  });

  res.json({ success: true, message: 'User updated successfully.' });
});

// ============================================================================
// 6. AUDIT LOGS ENDPOINTS
// ============================================================================

/**
 * Retrieve Audit Trail
 */
apiRouter.get('/admin/audit-logs', authenticateSession, requirePermission('audit.read'), (req, res) => {
  const { limit = 50, offset = 0, action, result, userId } = req.query;
  const logs = getAuditLogs({ limit, offset, action, result, userId });
  res.json({ success: true, logs });
});

// ============================================================================
// 7. SYSTEM DASHBOARD STATS
// ============================================================================

/**
 * Dashboard Statistics
 */
apiRouter.get('/admin/dashboard/stats', authenticateSession, (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count;
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM content WHERE is_deleted = 0').get().count;
  const fileCount = db.prepare('SELECT COUNT(*) as count FROM files WHERE is_deleted = 0').get().count;
  const activeSessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP').get().count;
  const recentAudit = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5').all();

  res.json({
    success: true,
    stats: {
      userCount,
      contentCount,
      fileCount,
      activeSessionCount,
      recentAudit
    }
  });
});

// ============================================================================
// 8. PUBLIC SITE CONTENT READ-ONLY ENDPOINT
// ============================================================================
apiRouter.get('/content', (req, res) => {
  const items = db.prepare(`
    SELECT section, content_key, value_fa, value_en, content_type
    FROM content
    WHERE is_deleted = 0 AND status = 'published'
  `).all();
  res.json({ success: true, items });
});

