/**
 * FluidMind Service Worker (PWA)
 * Enables offline caching, fast loading, and home screen installation
 * Author: Mohammadamin Sharif • FluidMind
 */

const CACHE_NAME = 'fluidmind-v1.2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/assets/css/liquid-glass.css',
  '/assets/css/solidworks-course.css',
  '/assets/css/business-decision-matrix.css',
  '/assets/js/compressor-engine.js',
  '/assets/js/engineering-bg.js',
  '/assets/js/solidworks-content.js',
  '/assets/js/solidworks-course.js',
  '/assets/js/business-decision-matrix.js',
  '/assets/js/business-interactive-suite.js',
  '/assets/js/business-academy.js'
];

// Install: Cache critical core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache non-critical resource failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate for static assets, Network-first for navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET and chrome-extension/external API requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  // Navigation requests: Network first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  // Static assets: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
