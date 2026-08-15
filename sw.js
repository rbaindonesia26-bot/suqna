const CACHE_NAME = 'suqna-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch from Cache or Network
self.addEventListener('fetch', event => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;
  
  // Abaikan request ke Firestore/Firebase agar selalu up-to-date
  if (event.request.url.includes('firestore.googleapis.com')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, gunakan cache
        if (response) {
          return response;
        }
        
        // Jika tidak, ambil dari jaringan
        return fetch(event.request).then(
          response => {
            // Cek jika response valid
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Simpan ke cache untuk penggunaan berikutnya
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
