const CACHE_NAME = 'voice-app-v1';
const urlsToCache = [
  '/voice-app/',
  '/voice-app/index.html',
  '/voice-app/style.css',
  '/voice-app/script.js',
  '/voice-app/icon.png'
];

// ইনস্টল করার সময় ফাইলগুলো ক্যাশ করে রাখা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ইন্টারনেট থেকে নতুন ডেটা ফেচ করা বা ক্যাশ থেকে দেখানো
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});