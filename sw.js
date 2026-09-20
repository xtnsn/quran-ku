// Service Worker for Tahfidz Tracker (PRD v2)
const CACHE_NAME = 'tahfidz-tracker-v19';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Clear all old caches
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. NEVER intercept Supabase database API calls - let the browser handle them directly
  if (url.includes('supabase.co')) {
    return;
  }

  // 2. NEVER intercept non-GET requests (POST, PATCH, DELETE, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. NEVER cache external audio streaming
  if (url.includes('.mp3') || url.includes('/audio/')) {
    return;
  }

  // 4. For local static assets (HTML, CSS, JS, local JSON/Quran), use Network-first with Cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

