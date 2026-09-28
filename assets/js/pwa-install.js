/**
 * FluidMind Progressive Web App (PWA) Engine
 * مدیریت جامع نصب وب‌اپلیکیشن روی گوشی (اندروید و iOS) و دسکتاپ
 * مجهز به بنر پیشنهادی شناور در پایین صفحه، کنترلر سرویس ورکر، و راهنمای نصب گام‌به‌گام
 * Author: Mohammadamin Sharif • FluidMind
 */

(function () {
  'use strict';

  let deferredInstallPrompt = null;
  const STORAGE_DISMISS_KEY = 'fluidmind_pwa_dock_dismissed_at';
  const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  // 1. Check if running in standalone mode (already installed app)
  function isStandaloneApp() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  // 2. Detect iOS devices
  function isIOSDevice() {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
  }

  // 3. Register Service Worker safely
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            console.log('[FluidMind PWA] Service Worker active with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[FluidMind PWA] Service Worker registration note:', err);
          });
      });
    }
  }

  // 4. Capture native beforeinstallprompt event (Android / Chromium)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('[FluidMind PWA] Captured beforeinstallprompt event');

    updateInstallButtonVisibility(true);
    scheduleBottomDockDisplay();
  });

  // 5. Handle appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('[FluidMind PWA] Application was successfully installed!');
    deferredInstallPrompt = null;
    hideBottomDock();
    updateInstallButtonVisibility(false);
    closePWAInstallModal();

    if (typeof window.showGlobalToast === 'function') {
      window.showGlobalToast('اپلیکیشن FluidMind با موفقیت روی دستگاه شما نصب گردید!');
    }
  });

  function updateInstallButtonVisibility(available) {
    const navBtn = document.getElementById('pwaNavInstallBtn');
    const drawerBtn = document.getElementById('pwaMobileDrawerInstallBtn');

    if (isStandaloneApp()) {
      if (navBtn) navBtn.style.display = 'none';
      if (drawerBtn) drawerBtn.style.display = 'none';
      return;
    }

    if (available || !isStandaloneApp()) {
      if (navBtn) navBtn.style.display = 'inline-flex';
      if (drawerBtn) drawerBtn.style.display = 'flex';
    }
  }

  function scheduleBottomDockDisplay() {
    if (isStandaloneApp()) return;

    // Check if user dismissed it in this 24-hour period
    const dismissedAt = localStorage.getItem(STORAGE_DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) {
        return; // Respect user dismissal
      }
    }

    // Friendly 2.2s delay after page load for subtle entrance
    setTimeout(() => {
      const dock = document.getElementById('pwaBottomDock');
      if (dock && !isStandaloneApp()) {
        dock.classList.add('visible');
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }
    }, 2200);
  }

  window.dismissPWADock = function () {
    hideBottomDock();
    try {
      localStorage.setItem(STORAGE_DISMISS_KEY, Date.now().toString());
    } catch (e) {}
  };

  function hideBottomDock() {
    const dock = document.getElementById('pwaBottomDock');
    if (dock) {
      dock.classList.remove('visible');
    }
  }

  // 6. Trigger installation flow
  window.triggerPWAInstall = async function () {
    if (isStandaloneApp()) {
      if (typeof window.showGlobalToast === 'function') {
        window.showGlobalToast('اپلیکیشن در حال حاضر روی دستگاه شما نصب است');
      }
      return;
    }

    // If native prompt is available (Android Chrome / Chromium Desktop)
    if (deferredInstallPrompt) {
      hideBottomDock();
      try {
        await deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        console.log('[FluidMind PWA] Install choice outcome:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
          deferredInstallPrompt = null;
          updateInstallButtonVisibility(false);
        }
      } catch (err) {
        console.warn('[FluidMind PWA] Install prompt error:', err);
        openPWAInstallModal();
      }
      return;
    }

    // Otherwise show step-by-step guided installation modal
    openPWAInstallModal();
  };

  // 7. Guided Modal for iOS Safari, Android without prompt, or Desktop
  window.openPWAInstallModal = function () {
    const modal = document.getElementById('pwaInstallModal');
    if (!modal) return;

    const titleEl = document.getElementById('pwaModalTitle');
    const descEl = document.getElementById('pwaModalDesc');
    const stepsListEl = document.getElementById('pwaModalStepsList');

    const isCurrentFa = document.documentElement.lang !== 'en';
    const isIOS = isIOSDevice();

    if (isIOS) {
      if (titleEl) {
        titleEl.textContent = isCurrentFa ? 'نصب اپلیکیشن روی آیفون / آیپد (iOS)' : 'Install FluidMind on iPhone / iPad';
      }
      if (descEl) {
        descEl.textContent = isCurrentFa
          ? 'برای نصب آیکون اپلیکیشن روی صفحه اصلی گوشی، مراحل زیر را در مرورگر Safari انجام دهید:'
          : 'To add FluidMind icon to your home screen, follow these steps in Safari:';
      }
      if (stepsListEl) {
        stepsListEl.innerHTML = `
          <li class="pwa-ios-step-item">
            <span class="pwa-ios-step-num">۱</span>
            <div>
              <strong>${isCurrentFa ? 'دکمه اشتراک‌گذاری (Share)' : 'Tap Share'}</strong>
              <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${isCurrentFa ? 'در نوار پایین مرورگر سافاری روی آیکون مربع با فلش رو به بالا بزنید.' : 'Tap the share button with the arrow pointing up in Safari toolbar.'}</div>
            </div>
          </li>
          <li class="pwa-ios-step-item">
            <span class="pwa-ios-step-num">۲</span>
            <div>
              <strong>${isCurrentFa ? 'انتخاب «Add to Home Screen»' : 'Select "Add to Home Screen"'}</strong>
              <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${isCurrentFa ? 'در منوی باز شده به پایین اسکرول کرده و گزینه افزودن به صفحه اصلی را بزنید.' : 'Scroll down in the action sheet and tap "Add to Home Screen".'}</div>
            </div>
          </li>
          <li class="pwa-ios-step-item">
            <span class="pwa-ios-step-num">۳</span>
            <div>
              <strong>${isCurrentFa ? 'تایید و افزودن (Add)' : 'Tap "Add"'}</strong>
              <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${isCurrentFa ? 'در گوشه بالا سمت راست دکمه Add را لمس کنید تا آیکون لوگوی سایت روی صفحه نصب گردد.' : 'Tap "Add" in the top-right corner to install the icon on your screen.'}</div>
            </div>
          </li>
        `;
      }
    } else {
      if (titleEl) {
        titleEl.textContent = isCurrentFa ? 'نصب وب‌اپلیکیشن روی گوشی (اندروید / کروم)' : 'Install FluidMind Web App';
      }
      if (descEl) {
        descEl.textContent = isCurrentFa
          ? 'برای داشتن آیکون اختصاصی و تجربه روان و تمام‌صفحه بدون نیاز به گوگل‌پلی، مراحل زیر را دنبال کنید:'
          : 'To install the native full-screen app icon directly on your phone:';
      }
      if (stepsListEl) {
        stepsListEl.innerHTML = `
          <li class="pwa-ios-step-item">
            <span class="pwa-ios-step-num">۱</span>
            <div>
              <strong>${isCurrentFa ? 'منوی سه‌نقطه مرورگر' : 'Browser 3-Dots Menu'}</strong>
              <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${isCurrentFa ? 'در بالای صفحه مرورگر کروم، روی علامت سه‌نقطه (...) بزنید.' : 'Tap the 3 dots menu button at the top corner of Chrome.'}</div>
            </div>
          </li>
          <li class="pwa-ios-step-item">
            <span class="pwa-ios-step-num">۲</span>
            <div>
              <strong>${isCurrentFa ? 'نصب برنامه یا افزودن به صفحه اصلی' : 'Install app / Add to Home screen'}</strong>
              <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${isCurrentFa ? 'گزینه «نصب برنامه (Install app)» یا «افزودن به صفحه اصلی (Add to Home screen)» را انتخاب کنید.' : 'Select "Install app" or "Add to Home screen" option.'}</div>
            </div>
          </li>
          <li class="pwa-ios-step-item">
            <span class="pwa-ios-step-num">۳</span>
            <div>
              <strong>${isCurrentFa ? 'تایید نصب (Install)' : 'Confirm Install'}</strong>
              <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${isCurrentFa ? 'دکمه Install را بزنید تا برنامه با آیکون رسمی به جمع اپلیکیشن‌های گوشی شما بپیوندد.' : 'Click Install to finish adding FluidMind to your mobile apps.'}</div>
            </div>
          </li>
        `;
      }
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  window.closePWAInstallModal = function () {
    const modal = document.getElementById('pwaInstallModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  // 8. Auto-initialize
  registerServiceWorker();

  document.addEventListener('DOMContentLoaded', () => {
    if (!isStandaloneApp()) {
      updateInstallButtonVisibility(true);
      scheduleBottomDockDisplay();
    }
  });

})();
