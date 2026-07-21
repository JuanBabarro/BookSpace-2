const CACHE_NAME = 'bookspace-v1';
const urlsToCache = [
  '/',
  '/html/index.html',
  '/html/home.html',
  '/html/modal.html',
  '/html/mylist.html',
  '/html/perfil.html',
  '/html/rating-modal.html',
  '/html/reader.html',
  '/html/register.html',
  '/css/main.css',
  '/css/dashboard.css',
  '/css/login.css',
  '/css/register.css',
  '/css/reader.css',
  '/css/perfil.css',
  '/css/modal.css',
  '/css/mylist.css',
  '/css/rating-modal.css',
  '/js/dashboard.js',
  '/js/login.js',
  '/js/perfil.js',
  '/js/reader.js',
  '/js/register.js',
  '/js/pwa.js',
  '/images/b5115b72-8826-4cb9-ac17-2b6836d731e0.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Return fetch network request
        return fetch(event.request).catch(() => {
          console.log('Fetch failed; returning offline page instead.', event.request.url);
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
