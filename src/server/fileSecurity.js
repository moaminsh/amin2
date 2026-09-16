import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Dedicated uploads storage directory (isolated from web root execution)
export const UPLOAD_DIR = path.join(rootDir, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Whitelist of strictly permitted file extensions
export const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
  'pdf', 'zip', 'csv', 'txt', 'json'
]);

// Whitelist of strictly permitted MIME types
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/csv',
  'text/plain',
  'application/json'
]);

// Known file magic byte signatures
const MAGIC_SIGNATURES = {
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  jpeg: [0xFF, 0xD8, 0xFF],
  gif: [0x47, 0x49, 0x46, 0x38],
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  zip: [0x50, 0x4B, 0x03, 0x04], // PK..
  webp: [0x52, 0x49, 0x46, 0x46]  // RIFF (first 4 bytes, WebP also has WEBP at byte 8)
};

/**
 * Validates file buffer against known binary signatures
 */
export function validateMagicBytes(buffer, ext) {
  const normExt = ext.toLowerCase().replace('.', '');
  if (normExt === 'jpeg' || normExt === 'jpg') {
    return buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (normExt === 'png') {
    const sig = MAGIC_SIGNATURES.png;
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  }
  if (normExt === 'gif') {
    const sig = MAGIC_SIGNATURES.gif;
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  }
  if (normExt === 'pdf') {
    const sig = MAGIC_SIGNATURES.pdf;
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  }
  if (normExt === 'zip') {
    const sig = MAGIC_SIGNATURES.zip;
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  }
  if (normExt === 'webp') {
    if (buffer.length < 12) return false;
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }
  // For text/json/csv/svg, we perform textual sanitization instead of binary magic header
  return true;
}

/**
 * Sanitize and validate SVG content to neutralize XSS vectors
 */
export function sanitizeSVG(svgString) {
  // Reject SVGs containing suspicious script execution elements or event handlers
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /\bon\w+\s*=/gi, // onerror, onload, onclick etc.
    /javascript:/gi,
    /data:text\/html/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /<foreignObject/gi
  ];

  let cleaned = svgString;
  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '');
    }
  }

  // Must still have valid root <svg> element
  if (!/<svg\b[^>]*>/i.test(cleaned)) {
    throw new Error('Invalid SVG XML format');
  }

  return cleaned;
}

/**
 * Validates and normalizes upload request metadata
 */
export function sanitizeFilename(originalName) {
  // Check for null bytes, directory traversal patterns, or multiple dots
  if (!originalName || typeof originalName !== 'string') {
    throw new Error('Missing original file name');
  }
  if (originalName.includes('\0') || originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
    throw new Error('Path traversal sequence detected in filename');
  }

  // Check double extension attack (e.g., shell.php.jpg)
  const segments = originalName.split('.');
  if (segments.length > 2) {
    const dangerousSubExts = ['php', 'phtml', 'sh', 'exe', 'bat', 'cmd', 'js', 'mjs', 'cgi', 'pl', 'py', 'jar', 'jsp', 'asp', 'aspx'];
    for (let i = 1; i < segments.length - 1; i++) {
      if (dangerousSubExts.includes(segments[i].toLowerCase())) {
        throw new Error('Prohibited double extension detected');
      }
    }
  }

  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File extension '.${ext}' is not permitted.`);
  }

  // Generate a strictly randomized, safe storage filename
  const randomPrefix = crypto.randomUUID().replace(/-/g, '');
  const timestamp = Date.now();
  const storedName = `${timestamp}_${randomPrefix}.${ext}`;

  return { ext, storedName };
}

/**
 * Check if a filename or path is safe against path traversal
 */
export function isSafePath(filename) {
  if (!filename || typeof filename !== 'string') return false;
  if (filename.includes('\0') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  return true;
}

/**
 * Validate an in-memory file buffer comprehensively (ext, mime, magic bytes, XSS)
 */
export function validateFileBuffer(file) {
  try {
    if (!file || !file.originalname || !file.buffer) {
      return { valid: false, error: 'Invalid file payload' };
    }
    const { ext, storedName } = sanitizeFilename(file.originalname);
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return { valid: false, error: `Disallowed MIME type: ${file.mimetype}` };
    }
    const matchesMagic = validateMagicBytes(file.buffer, ext);
    if (!matchesMagic) {
      return { valid: false, error: 'File magic bytes do not match declared extension.' };
    }
    if (ext === 'svg') {
      const svgText = file.buffer.toString('utf-8');
      if (/<script\b/i.test(svgText) || /\bon\w+\s*=/i.test(svgText) || /javascript:/i.test(svgText)) {
        return { valid: false, error: 'SVG contains prohibited executable scripts or event handlers.' };
      }
      sanitizeSVG(svgText);
    }
    return { valid: true, ext, storedName };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Prevent Path Traversal during file retrieval
 */
export function resolveSafePath(filename) {
  if (!isSafePath(filename)) {
    throw new Error('Invalid file path request');
  }
  const resolved = path.resolve(UPLOAD_DIR, filename);
  if (!resolved.startsWith(UPLOAD_DIR)) {
    throw new Error('Access denied: Path traversal outside upload boundary');
  }
  return resolved;
}
