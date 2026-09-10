const CACHE = 'tpp-customer-v18';
const SHELL = [
  '/order/',
  '/order/manifest.webmanifest',
  '/order/styles.css',
  '/order/app.js',
  '/order/icons/icon-192.png',
  '/order/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // API calls must always reach the live backend.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  // Navigation: prefer the live page, fall back to cached shell if offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put('/order/', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/order/'))
    );
    return;
  }

  // Static customer assets: cache first, then network.
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      if (res.ok) caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});
