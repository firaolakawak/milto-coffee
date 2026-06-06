const CACHE_NAME = 'milto-coffee-v2';
const APP_SHELL = [
  '/',
  '/manifest.json',
];

// Paths that must NEVER be cached (Vite dev/build internals + JS/CSS chunks)
const NEVER_CACHE = [
  '/src/',
  '/node_modules/.vite',
  '/@vite',
  '/@react-refresh',
  '.vite/deps',
];

const shouldNeverCache = (url) => {
  return NEVER_CACHE.some(p => url.includes(p));
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Never cache Vite internals or JS/CSS chunks
  if (shouldNeverCache(url) || url.includes('.js') || url.includes('.css')) {
    return; // fall through to network
  }

  // Network-first for API calls
  if (url.includes('/api/') || url.includes('base44')) {
    return; // fall through to network
  }

  // Cache-first for static assets (images, fonts, manifest)
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Network-first with offline fallback for documents
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
  }
});

self.addEventListener('push', (event) => {
  let data = { title: 'Milto Coffee', body: 'You have a new notification', icon: '/icons/icon-192.png' };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch (e) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
