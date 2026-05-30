// വെള്ളം കേറിയോ? — Service Worker for Push Notifications

self.addEventListener('push', (event) => {
  let data = {
    title: '🌊 വെള്ളം കേറിയോ?',
    body: 'നിങ്ങളുടെ പ്രദേശത്ത് ദുരന്ത റിപ്പോർട്ട്! (Disaster reported near you!)',
    icon: '/favicon.ico',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    // Use defaults if JSON parsing fails
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
      },
      actions: [
        { action: 'open', title: 'തുറക്കുക (Open)' },
        { action: 'dismiss', title: 'ഡിസ്മിസ്' },
      ],
    })
  );
});

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

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
