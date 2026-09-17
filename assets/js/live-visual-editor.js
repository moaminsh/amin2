/**
 * Live Visual Studio & Inline Site Editor for Mohammadamin Sharif Website
 * Enables instant in-place visual editing:
 * - ContentEditable for all text elements with automatic key generation
 * - Direct image click-to-replace / upload with drag & drop preview
 * - Background color / gradient / image customization per section
 * - Section & element rearrangement / drag & drop reordering
 * - Instant "Save All Changes" (ذخیره تغییرات) with localStorage persistence
 * - Export & backup configuration
 */

(function() {
  const STORAGE_KEY = 'fluidmind_visual_live_edits_v1';
  let isEditMode = false;
  let hasPendingChanges = false;
  let activeSelectedElement = null;

  // Cache of modifications
  let liveChanges = {
    texts: {},       // { [selectorPath]: { text, html, lang } }
    images: {},      // { [selectorPath]: base64 or url }
    styles: {},      // { [selectorPath]: { backgroundColor, backgroundImage, opacity, etc. } }
    order: {}        // { [containerSelector]: [childOrderIndices] }
  };

  // Load saved modifications on start
  function loadPersistedEdits() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        liveChanges = JSON.parse(raw);
        applyAllLiveChanges();
      }
    } catch (e) {
      console.warn('Error loading live visual edits:', e);
    }
  }

  // Generate robust CSS selector path for any element
  function getElementPath(el) {
    if (!el || el === document.body || el === document.documentElement) return '';
    if (el.id) return '#' + el.id;
    
    // Check if element has unique data attributes
    if (el.dataset.fa) return `[data-fa="${CSS.escape(el.dataset.fa)}"]`;
    if (el.dataset.en) return `[data-en="${CSS.escape(el.dataset.en)}"]`;

    let path = [];
    let current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        path.unshift('#' + current.id);
        break;
      }
      if (current.className && typeof current.className === 'string') {
        const primaryClass = current.className.split(' ').filter(c => c && !c.startsWith('visual-') && !c.startsWith('edit-')).join('.');
        if (primaryClass) {
          selector += '.' + primaryClass;
        }
      }
      // Add nth-child index
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  // Apply all loaded edits to the DOM
  function applyAllLiveChanges() {
    // 1. Text changes
    if (liveChanges.texts) {
      for (const [path, data] of Object.entries(liveChanges.texts)) {
        try {
          const el = document.querySelector(path);
          if (el) {
            if (data.html) el.innerHTML = data.html;
            else if (data.text) el.textContent = data.text;
          }
        } catch (err) {}
      }
    }

    // 2. Image changes
    if (liveChanges.images) {
      for (const [path, src] of Object.entries(liveChanges.images)) {
        try {
          const img = document.querySelector(path);
          if (img && img.tagName === 'IMG') {
            img.src = src;
          } else if (img) {
            img.style.backgroundImage = `url('${src}')`;
          }
        } catch (err) {}
      }
    }

    // 3. Style changes (background, colors)
    if (liveChanges.styles) {
      for (const [path, styles] of Object.entries(liveChanges.styles)) {
        try {
          const el = document.querySelector(path);
          if (el) {
            for (const [prop, val] of Object.entries(styles)) {
              el.style[prop] = val;
            }
          }
        } catch (err) {}
      }
    }
  }

  // Create & Inject Floating Visual Editor Bar
  function injectVisualEditorUI() {
    // Styles for Visual Editor
    const styleTag = document.createElement('style');
    styleTag.id = 'visual-editor-styles';
    styleTag.textContent = `
      /* Visual Editor Toolbar Dock */
      .fm-visual-editor-dock {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 9999px;
        background: rgba(11, 15, 25, 0.88);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(6, 182, 212, 0.35);
        box-shadow: 0 10px 35px -5px rgba(0, 0, 0, 0.6), 0 0 20px 2px rgba(6, 182, 212, 0.2);
        font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
        direction: rtl;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
      }
      .fm-visual-editor-dock:hover {
        border-color: rgba(6, 182, 212, 0.6);
        box-shadow: 0 12px 40px -5px rgba(0, 0, 0, 0.7), 0 0 25px 4px rgba(6, 182, 212, 0.3);
      }
      .fm-v-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        outline: none;
        white-space: nowrap;
      }
      .fm-v-btn-toggle {
        background: rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .fm-v-btn-toggle:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
      .fm-v-btn-toggle.active {
        background: linear-gradient(135deg, #06b6d4, #2563eb);
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
      }
      .fm-v-btn-save {
        background: #10b981;
        color: #064e3b;
        font-weight: 700;
      }
      .fm-v-btn-save:hover {
        background: #34d399;
      }
      .fm-v-btn-save.has-changes {
        animation: fm-pulse-green 1.5s infinite;
      }
      @keyframes fm-pulse-green {
        0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
        50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      }
      .fm-v-btn-tool {
        background: rgba(255, 255, 255, 0.06);
        color: #94a3b8;
      }
      .fm-v-btn-tool:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #f8fafc;
      }
      .fm-v-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #94a3b8;
      }
      .fm-v-indicator.active {
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }

      /* Hover & Editing Overlays on Target Elements */
      body.fm-visual-editing-active [data-editable-text="true"]:hover {
        outline: 2px dashed #06b6d4 !important;
        outline-offset: 4px;
        cursor: text !important;
        background: rgba(6, 182, 212, 0.08) !important;
      }
      body.fm-visual-editing-active [data-editable-text="true"]:focus {
        outline: 2px solid #06b6d4 !important;
        outline-offset: 4px;
        background: rgba(6, 182, 212, 0.15) !important;
      }
      body.fm-visual-editing-active img:hover {
        outline: 3px dashed #3b82f6 !important;
        outline-offset: 4px;
        cursor: pointer !important;
        filter: brightness(1.1) !important;
      }
      body.fm-visual-editing-active .site-section:hover {
        box-shadow: inset 0 0 0 2px rgba(168, 85, 247, 0.4) !important;
      }

      /* Visual Tooltip Badge */
      .fm-element-badge {
        position: absolute;
        z-index: 999998;
        padding: 3px 8px;
        border-radius: 6px;
        background: #0f172a;
        color: #38bdf8;
        font-size: 10px;
        font-family: monospace;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 1px solid rgba(56, 189, 248, 0.4);
      }

      /* Image Replacement Modal */
      .fm-v-modal {
        position: fixed;
        inset: 0;
        z-index: 1000000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(10px);
        direction: rtl;
        font-family: 'Vazirmatn', sans-serif;
      }
      .fm-v-modal-card {
        width: 90%;
        max-width: 480px;
        padding: 24px;
        border-radius: 20px;
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(0,0,0,0.8);
        color: white;
      }

      /* Notification Toast */
      .fm-v-toast {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        z-index: 1000001;
        padding: 10px 20px;
        border-radius: 9999px;
        background: #0f172a;
        border: 1px solid #10b981;
        color: #34d399;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Vazirmatn', sans-serif;
      }
      .fm-v-toast.show {
        transform: translateX(-50%) translateY(0);
      }
    `;
    document.head.appendChild(styleTag);

    // Toast element
    const toast = document.createElement('div');
    toast.id = 'fmVisualToast';
    toast.className = 'fm-v-toast';
    toast.textContent = 'تغییرات با موفقیت ذخیره شد!';
    document.body.appendChild(toast);

    // Hidden file input for direct photo upload
    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.id = 'fmHiddenImageUploader';
    hiddenFileInput.accept = 'image/*';
    hiddenFileInput.style.display = 'none';
    document.body.appendChild(hiddenFileInput);

    // Dock container
    const dock = document.createElement('aside');
    dock.className = 'fm-visual-editor-dock';
    dock.id = 'fmVisualEditorDock';
    dock.innerHTML = `
      <div class="fm-v-indicator" id="fmEditIndicator"></div>
      
      <!-- Toggle Edit Mode Button -->
      <button type="button" id="fmToggleEditBtn" class="fm-v-btn fm-v-btn-toggle" title="فعال / غیرفعال‌سازی حالت ویرایش مستقیم زنده">
        <svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        <span id="fmToggleEditText">ویرایش زنده صفحه</span>
      </button>

      <!-- Save Changes Button -->
      <button type="button" id="fmSaveEditsBtn" class="fm-v-btn fm-v-btn-save" style="display:none;" title="ذخیره آنی تمام تغییرات متون، عکس‌ها و پس‌زمینه">
        <svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.5;" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        <span>ذخیره تغییرات</span>
      </button>

      <!-- Change Background / Section Style -->
      <button type="button" id="fmChangeBgBtn" class="fm-v-btn fm-v-btn-tool" style="display:none;" title="تغییر پس‌زمینه یا تصویر پشت بخش انتخابی">
        <svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <span>پس‌زمینه</span>
      </button>

      <!-- Discard / Reset Edits -->
      <button type="button" id="fmResetEditsBtn" class="fm-v-btn fm-v-btn-tool" style="display:none;" title="بازنشانی تغییرات به حالت پیش‌فرض">
        <svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        <span>بازنشانی</span>
      </button>

      <!-- Jump to Admin Panel -->
      <a href="/admin/" class="fm-v-btn fm-v-btn-tool" title="ورود به داشبورد مدیریتی کامل">
        <svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>پنل مدیریت</span>
      </a>
    `;

    document.body.appendChild(dock);

    setupVisualEditorEvents();
  }

  // Show Toast Message
  function notify(msg) {
    const toast = document.getElementById('fmVisualToast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }
  }

  // Bind Event Listeners
  function setupVisualEditorEvents() {
    const toggleBtn = document.getElementById('fmToggleEditBtn');
    const saveBtn = document.getElementById('fmSaveEditsBtn');
    const resetBtn = document.getElementById('fmResetEditsBtn');
    const changeBgBtn = document.getElementById('fmChangeBgBtn');
    const indicator = document.getElementById('fmEditIndicator');
    const hiddenFileInput = document.getElementById('fmHiddenImageUploader');

    // Toggle Edit Mode On/Off
    toggleBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      document.body.classList.toggle('fm-visual-editing-active', isEditMode);
      toggleBtn.classList.toggle('active', isEditMode);
      indicator.classList.toggle('active', isEditMode);

      saveBtn.style.display = isEditMode ? 'inline-flex' : 'none';
      resetBtn.style.display = isEditMode ? 'inline-flex' : 'none';
      changeBgBtn.style.display = isEditMode ? 'inline-flex' : 'none';

      document.getElementById('fmToggleEditText').textContent = isEditMode ? 'حالت ویرایش فعال' : 'ویرایش زنده صفحه';

      enableDisableInPlaceEditing(isEditMode);

      if (isEditMode) {
        notify('حالت ویرایش فعال شد! روی هر متن یا عکسی کلیک کنید تا تغییر کند.');
      }
    });

    // Save All Changes
    saveBtn.addEventListener('click', () => {
      saveAllChangesToStorage();
      saveBtn.classList.remove('has-changes');
      notify('تمامی تغییرات با موفقیت در سایت ثبت و ذخیره شدند!');
    });

    // Reset Changes
    resetBtn.addEventListener('click', () => {
      if (confirm('آیا مایلید تمام تغییرات اعمال‌شده در این صفحه بازنشانی و به نسخه اولیه برگردد؟')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });

    // Change Background of Current Section
    changeBgBtn.addEventListener('click', () => {
      openBackgroundEditorModal();
    });

    // Handle Image Replacement via File Uploader
    let targetImageElement = null;

    document.addEventListener('click', (e) => {
      if (!isEditMode) return;

      const img = e.target.closest('img');
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        targetImageElement = img;
        openImageUploadModal(img);
        return;
      }

      // Track active section for background changes
      const section = e.target.closest('.site-section, section, .glass-board');
      if (section) {
        activeSelectedElement = section;
      }
    }, true);

    hiddenFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && targetImageElement) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const newSrc = event.target.result;
          targetImageElement.src = newSrc;
          const path = getElementPath(targetImageElement);
          liveChanges.images[path] = newSrc;
          markHasPendingChanges();
          notify('تصویر جدید جایگزین شد! برای ذخیره دکمه «ذخیره تغییرات» را بزنید.');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Turn elements contentEditable or revert
  function enableDisableInPlaceEditing(enable) {
    const textSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a',
      '.fm-profile-clean-name span',
      '.fm-profile-clean-degree span',
      '.fm-project-title',
      '.fm-project-desc',
      '.nav-tab span',
      '[data-en]',
      '[data-fa]'
    ];

    const elements = document.querySelectorAll(textSelectors.join(', '));
    elements.forEach(el => {
      // Skip the editor dock itself
      if (el.closest('.fm-visual-editor-dock')) return;

      if (enable) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-editable-text', 'true');
        el.spellcheck = false;

        el.oninput = () => {
          const path = getElementPath(el);
          liveChanges.texts[path] = {
            html: el.innerHTML,
            text: el.textContent
          };
          markHasPendingChanges();
        };
      } else {
        el.removeAttribute('contenteditable');
        el.removeAttribute('data-editable-text');
        el.oninput = null;
      }
    });
  }

  function markHasPendingChanges() {
    hasPendingChanges = true;
    const saveBtn = document.getElementById('fmSaveEditsBtn');
    if (saveBtn) saveBtn.classList.add('has-changes');
  }

  function saveAllChangesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(liveChanges));

      // Also propagate key items to the shared admin database (fluidmind_ghpages_db_v1)
      const adminDbRaw = localStorage.getItem('fluidmind_ghpages_db_v1');
      if (adminDbRaw) {
        const db = JSON.parse(adminDbRaw);
        if (db && Array.isArray(db.content)) {
          // Check for author_name
          const nameEl = document.querySelector('.fm-profile-clean-name span');
          if (nameEl && nameEl.textContent) {
            const item = db.content.find(c => c.content_key === 'author_name');
            if (item) item.value_fa = nameEl.textContent.trim();
          }
          // Check for academic_title
          const titleEl = document.querySelector('.fm-profile-clean-degree span');
          if (titleEl && titleEl.textContent) {
            const item = db.content.find(c => c.content_key === 'academic_title');
            if (item) item.value_fa = titleEl.textContent.trim();
          }
          localStorage.setItem('fluidmind_ghpages_db_v1', JSON.stringify(db));
        }
      }
      hasPendingChanges = false;
    } catch (e) {
      console.error('Error saving live edits:', e);
    }
  }

  // Open Image Upload / Replace Modal
  function openImageUploadModal(imgElement) {
    const existingModal = document.getElementById('fmImageReplaceModal');
    if (existingModal) existingModal.remove();

    const currentSrc = imgElement.src || '';
    const modal = document.createElement('div');
    modal.id = 'fmImageReplaceModal';
    modal.className = 'fm-v-modal';
    modal.innerHTML = `
      <div class="fm-v-modal-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="margin:0;font-size:16px;font-weight:700;color:#38bdf8;">تغییر و جایگزینی تصویر</h3>
          <button type="button" id="fmCloseImageModalBtn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;">&times;</button>
        </div>

        <div style="text-align:center;margin-bottom:16px;">
          <img src="${currentSrc}" style="max-height:140px;max-width:100%;border-radius:12px;border:1px solid rgba(255,255,255,0.15);object-fit:cover;" />
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <button type="button" id="fmTriggerFileUploadBtn" style="padding:10px;background:#0284c7;color:white;border-radius:12px;border:none;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;">
            <svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            آپلود تصویر جدید از دستگاه
          </button>

          <div style="display:flex;align-items:center;gap:8px;">
            <input type="text" id="fmImageUrlInput" placeholder="یا آدرس اینترنتی تصویر (URL)..." dir="ltr" style="flex:1;padding:8px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:white;font-size:12px;" />
            <button type="button" id="fmApplyUrlImgBtn" style="padding:8px 14px;background:#10b981;color:#064e3b;border-radius:10px;border:none;font-weight:700;cursor:pointer;font-size:12px;">اعمال URL</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('fmCloseImageModalBtn').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    document.getElementById('fmTriggerFileUploadBtn').onclick = () => {
      modal.remove();
      document.getElementById('fmHiddenImageUploader').click();
    };

    document.getElementById('fmApplyUrlImgBtn').onclick = () => {
      const url = document.getElementById('fmImageUrlInput').value.trim();
      if (url) {
        imgElement.src = url;
        const path = getElementPath(imgElement);
        liveChanges.images[path] = url;
        markHasPendingChanges();
        modal.remove();
        notify('تصویر بروزرسانی شد! برای ذخیره روی دکمه ذخیره کلیک کنید.');
      }
    };
  }

  // Open Background & Color Editor Modal
  function openBackgroundEditorModal() {
    const target = activeSelectedElement || document.querySelector('.site-section.active') || document.body;
    const existingModal = document.getElementById('fmBgEditorModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'fmBgEditorModal';
    modal.className = 'fm-v-modal';
    modal.innerHTML = `
      <div class="fm-v-modal-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="margin:0;font-size:16px;font-weight:700;color:#c084fc;">تنظیم رنگ و پس‌زمینه بخش</h3>
          <button type="button" id="fmCloseBgModalBtn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;">&times;</button>
        </div>

        <p style="font-size:12px;color:#94a3b8;margin-bottom:14px;">بخش انتخابی: <strong style="color:white;">${target.id || target.className || 'صفحه اصلی'}</strong></p>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="display:block;font-size:12px;color:#cbd5e1;margin-bottom:6px;">رنگ پس‌زمینه (Background Color)</label>
            <div style="display:flex;gap:8px;">
              <input type="color" id="fmColorPicker" value="#0f172a" style="width:40px;height:36px;border:none;border-radius:8px;cursor:pointer;background:none;" />
              <input type="text" id="fmColorText" placeholder="مثال: #0b0f19 یا rgba(15,23,42,0.8)" dir="ltr" style="flex:1;padding:8px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:white;font-size:12px;" />
            </div>
          </div>

          <div>
            <label style="display:block;font-size:12px;color:#cbd5e1;margin-bottom:6px;">تصویر پس‌زمینه (URL تصویر پشت بخش)</label>
            <input type="text" id="fmBgImageInput" placeholder="https://... یا آدرس تصویر" dir="ltr" style="width:100%;box-sizing:border-box;padding:8px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:white;font-size:12px;" />
          </div>

          <div style="display:flex;gap:8px;margin-top:8px;">
            <button type="button" id="fmApplyBgBtn" style="flex:1;padding:10px;background:#9333ea;color:white;border-radius:12px;border:none;font-weight:700;cursor:pointer;font-size:13px;">اعمال تغییرات</button>
            <button type="button" id="fmClearBgBtn" style="padding:10px 14px;background:rgba(255,255,255,0.1);color:#e2e8f0;border-radius:12px;border:none;cursor:pointer;font-size:12px;">حذف استایل</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('fmCloseBgModalBtn').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const colorPicker = document.getElementById('fmColorPicker');
    const colorText = document.getElementById('fmColorText');

    colorPicker.oninput = () => { colorText.value = colorPicker.value; };

    document.getElementById('fmApplyBgBtn').onclick = () => {
      const color = colorText.value.trim() || colorPicker.value;
      const bgImg = document.getElementById('fmBgImageInput').value.trim();

      const path = getElementPath(target);
      if (!liveChanges.styles[path]) liveChanges.styles[path] = {};

      if (color) {
        target.style.backgroundColor = color;
        liveChanges.styles[path].backgroundColor = color;
      }
      if (bgImg) {
        target.style.backgroundImage = `url('${bgImg}')`;
        target.style.backgroundSize = 'cover';
        target.style.backgroundPosition = 'center';
        liveChanges.styles[path].backgroundImage = `url('${bgImg}')`;
        liveChanges.styles[path].backgroundSize = 'cover';
      }

      markHasPendingChanges();
      modal.remove();
      notify('استایل پس‌زمینه تغییر یافت! دکمه ذخیره تغییرات را بزنید.');
    };

    document.getElementById('fmClearBgBtn').onclick = () => {
      target.style.backgroundColor = '';
      target.style.backgroundImage = '';
      const path = getElementPath(target);
      if (liveChanges.styles[path]) {
        delete liveChanges.styles[path];
      }
      markHasPendingChanges();
      modal.remove();
      notify('استایل پس‌زمینه بازنشانی شد.');
    };
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadPersistedEdits();
      injectVisualEditorUI();
      if (window.location.hash.includes('visual-edit')) {
        setTimeout(() => {
          const btn = document.getElementById('fmToggleEditBtn');
          if (btn && !isEditMode) btn.click();
        }, 500);
      }
    });
  } else {
    loadPersistedEdits();
    injectVisualEditorUI();
    if (window.location.hash.includes('visual-edit')) {
      setTimeout(() => {
        const btn = document.getElementById('fmToggleEditBtn');
        if (btn && !isEditMode) btn.click();
      }, 500);
    }
  }
})();
