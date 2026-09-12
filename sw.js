const CACHE_NAME = 'voice-app-v2';
const urlsToCache = [
  '/voice-app/',
  '/voice-app/index.html',
  '/voice-app/style.css',
  '/voice-app/script.js',
  '/voice-app/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});