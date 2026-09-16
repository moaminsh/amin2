// admin-client-engine.js - GitHub Pages & Standalone Client Engine
(function() {
  const STORAGE_KEY = 'fluidmind_ghpages_db_v1';
  const AUTH_KEY = 'fluidmind_ghpages_auth_user';

  // Check if we are running in static hosting (GitHub Pages or file protocol)
  window.isStaticHosting = function() {
    const host = window.location.hostname;
    return host.endsWith('github.io') || 
           window.location.protocol === 'file:' || 
           window.location.search.includes('mode=static');
  };

  // Default seed database if localStorage is empty
  const defaultDatabase = {
    users: [
      {
        id: "usr_fa5205c6bc7544fc88d0fc88750c7699",
        email: "mohammadaminsh1384@gmail.com",
        full_name: "محمدامین شریف",
        is_active: 1,
        requires_password_change: 0,
        failed_attempts: 0,
        locked_until: null,
        created_at: "2026-09-16 11:57:23",
        updated_at: "2026-09-16 11:57:23",
        roles: [{ id: "role_super_admin", name: "Super Admin" }]
      },
      {
        id: "usr_317fefb5aec84dd586829d4f52409b5b",
        email: "admin@fluidmind.internal",
        full_name: "مدیر ارشد سامانه",
        is_active: 1,
        requires_password_change: 0,
        failed_attempts: 0,
        locked_until: null,
        created_at: "2026-09-16 11:42:10",
        updated_at: "2026-09-16 11:42:10",
        roles: [{ id: "role_admin", name: "Admin" }]
      }
    ],
    content: [
      {
        id: "cnt_97e101b4760f4f58",
        section: "identity",
        content_key: "author_name",
        value_fa: "محمدامین شریف",
        value_en: "Mohammadamin Sharif",
        content_type: "text",
        status: "published",
        is_deleted: 0,
        created_at: "2026-09-16 11:42:10",
        updated_at: "2026-09-16 11:42:10"
      },
      {
        id: "cnt_6d877ba0538b48d0",
        section: "identity",
        content_key: "academic_title",
        value_fa: "دانشجوی مهندسی مکانیک • دانشگاه علم و صنعت ایران",
        value_en: "Mechanical Engineering Student • Iran University of Science & Technology (IUST)",
        content_type: "text",
        status: "published",
        is_deleted: 0,
        created_at: "2026-09-16 11:42:10",
        updated_at: "2026-09-16 11:42:10"
      },
      {
        id: "cnt_61dd24de8f5844a8",
        section: "contact",
        content_key: "email",
        value_fa: "mohammadaminsh1384@gmail.com",
        value_en: "mohammadaminsh1384@gmail.com",
        content_type: "email",
        status: "published",
        is_deleted: 0,
        created_at: "2026-09-16 11:42:10",
        updated_at: "2026-09-16 11:42:10"
      },
      {
        id: "cnt_fab32b53ef1f4b41",
        section: "contact",
        content_key: "phone",
        value_fa: "0903 276 4840",
        value_en: "+98 903 276 4840",
        content_type: "phone",
        status: "published",
        is_deleted: 0,
        created_at: "2026-09-16 11:42:10",
        updated_at: "2026-09-16 11:42:10"
      },
      {
        id: "cnt_0636229eae034ecd",
        section: "contact",
        content_key: "telegram",
        value_fa: "@aminsharif_mech",
        value_en: "@aminsharif_mech",
        content_type: "link",
        status: "published",
        is_deleted: 0,
        created_at: "2026-09-16 11:42:10",
        updated_at: "2026-09-16 11:42:10"
      },
      {
        id: "cnt_321402d2170b4736",
        section: "seo",
        content_key: "meta_title",
        value_fa: "محمدامین شریف | مهندسی مکانیک و مکانیک سیالات دانشگاه علم و صنعت",
        value_en: "Mohammadamin Sharif | Mechanical Engineering & Fluid Dynamics (IUST)",
        content_type: "text",
        status: "published",
        is_deleted: 0,
        created_at: "2026-09-16 11:42:10",
        updated_at: "2026-09-16 11:42:10"
      }
    ],
    files: [
      {
        id: "fil_seed_cv",
        original_name: "Mohammadamin_Sharif_Resume.pdf",
        stored_name: "resume_sample.pdf",
        file_size: 245760,
        extension: "pdf",
        mime_type: "application/pdf",
        is_private: 0,
        created_at: "2026-09-16 11:42:10"
      }
    ],
    audit_logs: [
      {
        id: "aud_01",
        action: "AUTH_LOGIN",
        resource: "admin_portal",
        details: "ورود مستقیم مدیر به پنل GitHub Pages (پردازش کلاینت)",
        ip_address: "Client Browser",
        user_email: "mohammadaminsh1384@gmail.com",
        result: "SUCCESS",
        created_at: new Date().toISOString()
      }
    ]
  };

  // Get local DB with fallback to seed
  function getDb() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    saveDb(defaultDatabase);
    return JSON.parse(JSON.stringify(defaultDatabase));
  }

  function saveDb(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Load external static-data.json if needed to merge
  async function initStaticDb() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      try {
        const res = await fetch('static-data.json');
        if (res.ok) {
          const json = await res.json();
          if (json && json.content) {
            saveDb(json);
            return json;
          }
        }
      } catch (err) {
        // Fallback to embedded defaultDatabase
      }
      saveDb(defaultDatabase);
    }
    return getDb();
  }

  // Helper response wrapper
  function mockResponse(data, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => data,
      text: async () => typeof data === 'string' ? data : JSON.stringify(data)
    };
  }

  // Standalone Static Router handling all admin requests locally
  async function handleStaticRequest(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const parsedUrl = new URL(url, window.location.href);
    const pathname = parsedUrl.pathname;
    const db = getDb();

    // 1. Auth Me
    if (pathname.endsWith('/api/admin/auth/me')) {
      const sessionUser = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
      if (sessionUser) {
        try {
          const user = JSON.parse(sessionUser);
          return mockResponse({ success: true, user });
        } catch (e) {}
      }
      return mockResponse({ success: false, message: 'Unauthenticated' }, 401);
    }

    // 2. Auth Login
    if (pathname.endsWith('/api/admin/auth/login')) {
      let body = {};
      try {
        body = JSON.parse(options.body || '{}');
      } catch (e) {}

      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';

      // Check user
      let matchedUser = db.users.find(u => u.email.toLowerCase() === email);
      if (!matchedUser) {
        // Allow the authorized email
        if (email.includes('mohammadaminsh1384') || email.includes('admin')) {
          matchedUser = {
            id: 'usr_' + Math.random().toString(36).substring(2, 9),
            email: email,
            full_name: email.includes('mohammadaminsh1384') ? 'محمدامین شریف' : 'مدیر سیستم',
            is_active: 1,
            requires_password_change: 0,
            failed_attempts: 0,
            roles: [{ id: 'role_super_admin', name: 'Super Admin' }]
          };
          db.users.push(matchedUser);
          saveDb(db);
        }
      }

      if (!matchedUser) {
        return mockResponse({ success: false, message: 'کاربری با این ایمیل یافت نشد.' }, 401);
      }

      const userSession = {
        id: matchedUser.id,
        email: matchedUser.email,
        full_name: matchedUser.full_name,
        roles: ['Super Admin', 'Admin'],
        is_mfa_enabled: false,
        requires_password_change: false
      };

      sessionStorage.setItem(AUTH_KEY, JSON.stringify(userSession));
      localStorage.setItem(AUTH_KEY, JSON.stringify(userSession));
      sessionStorage.setItem('fluidmind_admin_token', 'ghpages-client-token');

      // Log audit
      db.audit_logs.unshift({
        id: 'aud_' + Date.now(),
        action: 'AUTH_LOGIN',
        resource: 'admin_portal',
        details: 'ورود موفق به پنل روی GitHub Pages (محیط پردازش مرورگر)',
        ip_address: '127.0.0.1 (Client)',
        user_email: matchedUser.email,
        result: 'SUCCESS',
        created_at: new Date().toISOString()
      });
      saveDb(db);

      return mockResponse({
        success: true,
        user: userSession,
        token: 'ghpages-client-token',
        csrfToken: 'ghpages-csrf-token'
      });
    }

    // 3. Auth Logout
    if (pathname.endsWith('/api/admin/auth/logout')) {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem('fluidmind_admin_token');
      return mockResponse({ success: true, message: 'Logged out' });
    }

    // 4. Dashboard Stats
    if (pathname.endsWith('/api/admin/dashboard/stats')) {
      const stats = {
        contentCount: (db.content || []).filter(c => !c.is_deleted).length,
        fileCount: (db.files || []).length,
        activeSessionCount: 1,
        userCount: (db.users || []).length,
        recentAudit: (db.audit_logs || []).slice(0, 5)
      };
      return mockResponse({ success: true, stats });
    }

    // 5. Content Endpoints
    if (pathname.includes('/api/admin/content')) {
      const parts = pathname.split('/api/admin/content');
      const contentId = parts[1] ? parts[1].replace(/^\//, '') : null;

      // GET content list
      if (method === 'GET' && !contentId) {
        const search = parsedUrl.searchParams.get('search') || '';
        const section = parsedUrl.searchParams.get('section') || '';
        const status = parsedUrl.searchParams.get('status') || '';

        let items = (db.content || []).filter(c => !c.is_deleted);
        if (section) items = items.filter(c => c.section === section);
        if (status) items = items.filter(c => c.status === status);
        if (search) {
          const q = search.toLowerCase();
          items = items.filter(c => 
            (c.content_key && c.content_key.toLowerCase().includes(q)) ||
            (c.value_fa && c.value_fa.toLowerCase().includes(q)) ||
            (c.value_en && c.value_en.toLowerCase().includes(q))
          );
        }
        return mockResponse({ success: true, items });
      }

      // POST new content
      if (method === 'POST') {
        const payload = JSON.parse(options.body || '{}');
        const newItem = {
          id: 'cnt_' + Math.random().toString(36).substring(2, 12),
          section: payload.section || 'general',
          content_key: payload.content_key || 'key_' + Date.now(),
          value_fa: payload.value_fa || '',
          value_en: payload.value_en || '',
          content_type: payload.content_type || 'text',
          status: payload.status || 'published',
          is_deleted: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.content.push(newItem);
        saveDb(db);
        return mockResponse({ success: true, item: newItem });
      }

      // PUT update content
      if (method === 'PUT' && contentId) {
        const payload = JSON.parse(options.body || '{}');
        const item = (db.content || []).find(c => c.id === contentId);
        if (item) {
          Object.assign(item, {
            section: payload.section !== undefined ? payload.section : item.section,
            content_key: payload.content_key !== undefined ? payload.content_key : item.content_key,
            value_fa: payload.value_fa !== undefined ? payload.value_fa : item.value_fa,
            value_en: payload.value_en !== undefined ? payload.value_en : item.value_en,
            content_type: payload.content_type !== undefined ? payload.content_type : item.content_type,
            status: payload.status !== undefined ? payload.status : item.status,
            updated_at: new Date().toISOString()
          });
          saveDb(db);
          return mockResponse({ success: true, item });
        }
        return mockResponse({ success: false, message: 'Item not found' }, 404);
      }

      // DELETE soft delete content
      if (method === 'DELETE' && contentId) {
        const item = (db.content || []).find(c => c.id === contentId);
        if (item) {
          item.is_deleted = 1;
          saveDb(db);
          return mockResponse({ success: true, message: 'Content archived' });
        }
        return mockResponse({ success: false, message: 'Item not found' }, 404);
      }
    }

    // 6. Files Endpoints
    if (pathname.includes('/api/admin/files')) {
      const parts = pathname.split('/api/admin/files');
      const fileId = parts[1] ? parts[1].replace(/^\//, '') : null;

      if (method === 'GET' && !fileId) {
        const search = (parsedUrl.searchParams.get('search') || '').toLowerCase();
        let files = db.files || [];
        if (search) {
          files = files.filter(f => f.original_name.toLowerCase().includes(search));
        }
        return mockResponse({ success: true, files });
      }

      if (method === 'POST' && pathname.endsWith('/upload')) {
        let originalName = 'uploaded_file.bin';
        let fileSize = 1024;
        let ext = 'dat';
        let isPrivate = 0;

        if (options.body instanceof FormData) {
          const f = options.body.get('file');
          if (f && f.name) {
            originalName = f.name;
            fileSize = f.size || 1024;
            ext = originalName.split('.').pop().toLowerCase();
          }
          isPrivate = options.body.get('is_private') === 'true' ? 1 : 0;
        }

        const newFile = {
          id: 'fil_' + Date.now(),
          original_name: originalName,
          stored_name: 'gh_' + Date.now() + '_' + originalName,
          file_size: fileSize,
          extension: ext,
          mime_type: 'application/octet-stream',
          is_private: isPrivate,
          created_at: new Date().toISOString()
        };

        db.files.unshift(newFile);
        saveDb(db);
        return mockResponse({ success: true, file: newFile });
      }

      if (method === 'DELETE' && fileId) {
        db.files = (db.files || []).filter(f => f.id !== fileId);
        saveDb(db);
        return mockResponse({ success: true, message: 'File deleted' });
      }
    }

    // 7. Users Endpoints
    if (pathname.includes('/api/admin/users')) {
      const parts = pathname.split('/api/admin/users');
      const userId = parts[1] ? parts[1].replace(/^\//, '') : null;

      if (method === 'GET' && !userId) {
        const users = (db.users || []).map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          is_active: u.is_active,
          failed_attempts: u.failed_attempts || 0,
          roles: u.roles || [{ id: 'role_admin', name: 'Admin' }],
          created_at: u.created_at
        }));
        return mockResponse({ success: true, users });
      }

      if (method === 'POST') {
        const payload = JSON.parse(options.body || '{}');
        const newUser = {
          id: 'usr_' + Date.now(),
          email: payload.email,
          full_name: payload.full_name,
          is_active: 1,
          failed_attempts: 0,
          roles: [{ id: payload.role_id || 'role_admin', name: 'Admin' }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDb(db);
        return mockResponse({ success: true, user: newUser });
      }

      if (method === 'PUT' && userId) {
        const payload = JSON.parse(options.body || '{}');
        const user = (db.users || []).find(u => u.id === userId);
        if (user) {
          if (payload.is_active !== undefined) user.is_active = payload.is_active;
          saveDb(db);
          return mockResponse({ success: true, user });
        }
        return mockResponse({ success: false, message: 'User not found' }, 404);
      }
    }

    // 8. Sessions Endpoints
    if (pathname.includes('/api/admin/auth/sessions')) {
      if (pathname.endsWith('/revoke')) {
        return mockResponse({ success: true, message: 'Sessions revoked' });
      }
      return mockResponse({
        success: true,
        sessions: [
          {
            id: 'sess_ghpages_current',
            ip_address: '127.0.0.1 (مرورگر کلاینت)',
            user_agent: navigator.userAgent || 'Chrome / GitHub Pages Browser',
            last_active_at: new Date().toISOString(),
            isCurrent: true
          }
        ]
      });
    }

    // 9. Audit Logs
    if (pathname.includes('/api/admin/audit-logs')) {
      return mockResponse({
        success: true,
        logs: {
          rows: db.audit_logs || [],
          total: (db.audit_logs || []).length
        }
      });
    }

    // 10. Password Change
    if (pathname.endsWith('/api/admin/auth/change-password')) {
      return mockResponse({ success: true, message: 'Password updated successfully' });
    }

    // Fallback for other admin endpoints
    return mockResponse({ success: true, message: 'OK (GitHub Pages Mock)' });
  }

  // Export JSON Database
  window.exportDatabaseJson = function() {
    const data = getDb();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluidmind-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset Database to Default
  window.resetDatabaseDefaults = function() {
    if (confirm('آیا از بازنشانی داده‌ها به مقادیر اولیه مطمئن هستید؟')) {
      localStorage.removeItem(STORAGE_KEY);
      initStaticDb().then(() => {
        window.location.reload();
      });
    }
  };

  // Attach global static request handler
  window.handleStaticRequest = handleStaticRequest;
  window.initStaticDb = initStaticDb;

  // Auto initialize on script load
  initStaticDb();
})();
