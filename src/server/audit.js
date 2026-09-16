import { db } from './db.js';
import crypto from 'crypto';

/**
 * Sanitize object to remove sensitive keys before writing to audit log
 */
export function sanitizeForAudit(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sensitiveKeys = ['password', 'currentPassword', 'newPassword', 'token', 'csrfToken', 'secret', 'code', 'mfaToken'];
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key) || key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

/**
 * Audit Logger Service
 * Strictly prevents sensitive secrets (passwords, tokens, 2FA codes) from being recorded.
 */
export function logAuditEvent(req, { userId = null, action, resource = null, details = null, result = 'SUCCESS' }) {
  try {
    const id = 'aud_' + crypto.randomUUID().replace(/-/g, '');
    const ip = req?.headers['x-forwarded-for']?.split(',')[0]?.trim() || req?.socket?.remoteAddress || 'unknown';
    const userAgent = (req?.headers['user-agent'] || 'unknown').substring(0, 255);
    const requestId = req?.headers['x-request-id'] || crypto.randomUUID().slice(0, 8);

    // Sanitize details if object
    let detailsString = null;
    if (details) {
      if (typeof details === 'object') {
        const sanitized = sanitizeForAudit(details);
        detailsString = JSON.stringify(sanitized);
      } else {
        detailsString = String(details).substring(0, 500);
      }
    }

    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, resource, details, ip_address, user_agent, result, request_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    stmt.run(id, userId, action, resource, detailsString, ip, userAgent, result, requestId);
  } catch (err) {
    console.error('[AUDIT LOGGING FAILURE]', err.message);
  }
}

/**
 * Fetch Audit Logs with filtering and pagination
 */
export function getAuditLogs({ limit = 50, offset = 0, action = null, result = null, userId = null } = {}) {
  let query = `
    SELECT a.*, u.email as user_email, u.full_name as user_full_name
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (action) {
    query += ' AND a.action = ?';
    params.push(action);
  }
  if (result) {
    query += ' AND a.result = ?';
    params.push(result);
  }
  if (userId) {
    query += ' AND a.user_id = ?';
    params.push(userId);
  }

  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const rows = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;

  return { rows, total };
}
