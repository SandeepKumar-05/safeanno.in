// SafeAano? — Service Worker
// Push Notifications + Offline Caching

const CACHE_NAME = 'vellomkeriyo-v1';
const APP_SHELL = [
  '/',
  '/index.html',
];

// ── Install — cache app shell ──────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ── Activate — clean old caches ────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => clients.claim())
  );
});

// ── Fetch — network first, cache fallback ──────────────
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Supabase API calls and external APIs
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// ── Push Notification ──────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: '🌊 SafeAano?',
    body: 'നിങ്ങളുടെ പ്രദേശത്ത് ദുരന്ത റിപ്പോർട്ട്! (Disaster reported near you!)',
    icon: '/favicon.ico',
    reportId: null,
    url: '/',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    // Use defaults if JSON parsing fails
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [500, 200, 500, 200, 500],
    requireInteraction: true,
    tag: data.reportId || 'vellomkeriyo-alert',
    renotify: true,
    data: {
      url: data.url || '/',
      reportId: data.reportId,
    },
    actions: [
      { action: 'view', title: 'മാപ്പിൽ കാണുക (View)' },
      { action: 'dismiss', title: 'ഡിസ്മിസ്' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click ─────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if found
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
