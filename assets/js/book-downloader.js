/**
 * FluidMind Book Downloader & Resilient PDF Engine
 * Guarantees smooth download across iframe, desktop, and mobile devices
 */
(function() {
  window.downloadBookDirect = function(url, filename) {
    // Visual Toast Feedback
    const existing = document.getElementById('bookDownloadToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'bookDownloadToast';
    toast.className = 'book-download-toast';
    toast.innerHTML = `
      <div class="toast-inner-flex">
        <div class="toast-spinner"></div>
        <div class="toast-info">
          <div class="toast-title">در حال آغاز دانلود فایل... / Starting Download</div>
          <div class="toast-file">${filename || url.split('/').pop()}</div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    if (filename) link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      link.remove();
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  };

  // Bind to all download links on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const bookLinks = document.querySelectorAll('a[download], a[href$=".pdf"]');
    bookLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const filename = this.getAttribute('download') || href.split('/').pop();
        if (href && href.endsWith('.pdf')) {
          // Allow normal link behavior, but show feedback toast
          const existing = document.getElementById('bookDownloadToast');
          if (existing) existing.remove();

          const toast = document.createElement('div');
          toast.id = 'bookDownloadToast';
          toast.className = 'book-download-toast';
          toast.innerHTML = `
            <div class="toast-inner-flex">
              <div class="toast-spinner"></div>
              <div class="toast-info">
                <div class="toast-title">در حال آماده‌سازی و دانلود فایل PDF...</div>
                <div class="toast-file">${filename}</div>
              </div>
            </div>
          `;
          document.body.appendChild(toast);
          requestAnimationFrame(() => toast.classList.add('show'));
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
          }, 3500);
        }
      });
    });
  });
})();
