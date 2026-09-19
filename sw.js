// Service worker – offline provoz. Při změně souborů zvyš verzi.
const VERSION = 'karticky-v7';
const FILES = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'poses.js',
  'cards/cat1.js',
  'cards/cat1b.js',
  'cards/cat1c.js',
  'cards/cat1d.js',
  'cards/cat1e.js',
  'cards/cat2.js',
  'cards/cat2b.js',
  'cards/cat2c.js',
  'cards/cat2d.js',
  'cards/cat2e.js',
  'cards/cat3.js',
  'cards/cat3b.js',
  'cards/cat3c.js',
  'cards/cat3d.js',
  'cards/cat3e.js',
  'cards/cat4.js',
  'cards/cat4b.js',
  'cards/cat4c.js',
  'cards/cat4d.js',
  'cards/cat4e.js',
  'cards/cat5.js',
  'cards/cat5b.js',
  'cards/cat5c.js',
  'cards/cat5d.js',
  'cards/cat5e.js',
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

// Nejdřív síť (vždy nejnovější verze), bez připojení se použije uložená kopie.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then(cache => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
