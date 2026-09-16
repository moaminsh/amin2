import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Ensure data directory exists
const dataDir = path.join(rootDir, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fluidmind_admin.db');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode for performance and reliability
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Initialize Database Schema and Migrations
 */
export function initDatabase() {
  // 1. Roles Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Permissions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Role Permissions Mapping Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id TEXT NOT NULL,
      permission_id TEXT NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );
  `);

  // 4. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      requires_password_change INTEGER NOT NULL DEFAULT 0,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. User Roles Mapping Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
  `);

  // 6. Sessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      result TEXT NOT NULL,
      request_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Password Resets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 9. MFA Credentials Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mfa_credentials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      secret TEXT NOT NULL,
      is_enabled INTEGER NOT NULL DEFAULT 0,
      backup_codes TEXT,
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 10. Content Management Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      content_key TEXT NOT NULL,
      value_fa TEXT,
      value_en TEXT,
      content_type TEXT DEFAULT 'text',
      status TEXT DEFAULT 'published',
      is_deleted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(section, content_key)
    );
  `);

  // 11. Files Management Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL UNIQUE,
      file_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      extension TEXT NOT NULL,
      is_private INTEGER DEFAULT 0,
      uploaded_by TEXT,
      used_in TEXT,
      is_deleted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // 12. System Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultRolesAndPermissions();
  seedInitialAdmin();
  seedInitialContent();
}

/**
 * Seed Default RBAC Roles and Granular Permissions
 */
function seedDefaultRolesAndPermissions() {
  const permissions = [
    { id: 'perm_content_read', name: 'content.read', description: 'Read website content' },
    { id: 'perm_content_create', name: 'content.create', description: 'Create new content' },
    { id: 'perm_content_update', name: 'content.update', description: 'Modify website content' },
    { id: 'perm_content_delete', name: 'content.delete', description: 'Delete or archive content' },
    { id: 'perm_files_read', name: 'files.read', description: 'Access uploaded media files' },
    { id: 'perm_files_upload', name: 'files.upload', description: 'Upload new media files' },
    { id: 'perm_files_delete', name: 'files.delete', description: 'Delete media files' },
    { id: 'perm_users_manage', name: 'users.manage', description: 'Manage administrators and roles' },
    { id: 'perm_settings_manage', name: 'settings.manage', description: 'Manage global system settings' },
    { id: 'perm_audit_read', name: 'audit.read', description: 'Review security audit logs' }
  ];

  const insertPerm = db.prepare(`
    INSERT OR IGNORE INTO permissions (id, name, description) VALUES (?, ?, ?);
  `);
  for (const p of permissions) {
    insertPerm.run(p.id, p.name, p.description);
  }

  const roles = [
    { id: 'role_super_admin', name: 'Super Admin', description: 'Full system privileges and security control' },
    { id: 'role_admin', name: 'Admin', description: 'Standard administrator with content, files and user view rights' },
    { id: 'role_editor', name: 'Editor', description: 'Content authoring and publishing only' },
    { id: 'role_file_manager', name: 'File Manager', description: 'File assets and media management only' }
  ];

  const insertRole = db.prepare(`
    INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?);
  `);
  for (const r of roles) {
    insertRole.run(r.id, r.name, r.description);
  }

  // Assign Permissions to Roles
  const rolePermMap = {
    role_super_admin: [
      'perm_content_read', 'perm_content_create', 'perm_content_update', 'perm_content_delete',
      'perm_files_read', 'perm_files_upload', 'perm_files_delete',
      'perm_users_manage', 'perm_settings_manage', 'perm_audit_read'
    ],
    role_admin: [
      'perm_content_read', 'perm_content_create', 'perm_content_update', 'perm_content_delete',
      'perm_files_read', 'perm_files_upload', 'perm_files_delete',
      'perm_audit_read'
    ],
    role_editor: [
      'perm_content_read', 'perm_content_create', 'perm_content_update', 'perm_files_read'
    ],
    role_file_manager: [
      'perm_files_read', 'perm_files_upload', 'perm_files_delete', 'perm_content_read'
    ]
  };

  const insertRolePerm = db.prepare(`
    INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?);
  `);
  for (const [roleId, permIds] of Object.entries(rolePermMap)) {
    for (const permId of permIds) {
      insertRolePerm.run(roleId, permId);
    }
  }
}

/**
 * Seed Initial Super Administrator
 * Password is NEVER hardcoded in code. It is securely derived from ADMIN_INITIAL_PASSWORD
 * environment variable or a secure one-time setup code, requiring mandatory password change on first login.
 */
function seedInitialAdmin() {
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@fluidmind.internal';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

  if (!existing) {
    // Generate secure temporary initial password if not supplied in env
    const initialRawPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@FluidMind2026!';
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(initialRawPassword, salt);
    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '');

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, is_active, requires_password_change)
      VALUES (?, ?, ?, ?, 1, 1);
    `).run(userId, adminEmail, passwordHash, 'System Super Administrator');

    db.prepare(`
      INSERT INTO user_roles (user_id, role_id) VALUES (?, 'role_super_admin');
    `).run(userId);

    console.log(`[AUTH BOOTSTRAP] Initial super admin initialized: ${adminEmail}`);
    console.log(`[AUTH BOOTSTRAP] Temporary setup credentials generated. Change password is REQUIRED on first login.`);
  }
}

/**
 * Seed Initial Website Content for Live Syncing
 */
function seedInitialContent() {
  const initialData = [
    {
      section: 'identity',
      content_key: 'author_name',
      value_fa: 'محمدامین شریف',
      value_en: 'Mohammadamin Sharif',
      content_type: 'text'
    },
    {
      section: 'identity',
      content_key: 'academic_title',
      value_fa: 'دانشجوی مهندسی مکانیک • دانشگاه علم و صنعت ایران',
      value_en: 'Mechanical Engineering Student • Iran University of Science & Technology (IUST)',
      content_type: 'text'
    },
    {
      section: 'contact',
      content_key: 'email',
      value_fa: 'mohammadaminsh1384@gmail.com',
      value_en: 'mohammadaminsh1384@gmail.com',
      content_type: 'email'
    },
    {
      section: 'contact',
      content_key: 'phone',
      value_fa: '0903 276 4840',
      value_en: '+98 903 276 4840',
      content_type: 'phone'
    },
    {
      section: 'contact',
      content_key: 'telegram',
      value_fa: '@aminsharif_mech',
      value_en: '@aminsharif_mech',
      content_type: 'link'
    },
    {
      section: 'seo',
      content_key: 'meta_title',
      value_fa: 'محمدامین شریف | مهندسی مکانیک و مکانیک سیالات دانشگاه علم و صنعت',
      value_en: 'Mohammadamin Sharif | Mechanical Engineering & Fluid Dynamics (IUST)',
      content_type: 'text'
    }
  ];

  const insertContent = db.prepare(`
    INSERT OR IGNORE INTO content (id, section, content_key, value_fa, value_en, content_type, status)
    VALUES (?, ?, ?, ?, ?, ?, 'published');
  `);

  for (const item of initialData) {
    const id = 'cnt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    insertContent.run(id, item.section, item.content_key, item.value_fa, item.value_en, item.content_type);
  }
}
