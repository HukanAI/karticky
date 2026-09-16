// Service worker – offline provoz. Při změně souborů zvyš verzi.
const VERSION = 'karticky-v1';
const FILES = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'cards/cat1.js',
  'cards/cat2.js',
  'cards/cat3.js',
  'cards/cat4.js',
  'cards/cat5.js',
  'manifest.webmanifest',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Nejdřív cache (funguje offline), na pozadí stáhne novou verzi.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cached => {
        const network = fetch(event.request)
          .then(res => { if (res.ok) cache.put(event.request, res.clone()); return res; })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
