const CACHE_NAME = 'darkecho。write-0.5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Armor.html',
  '/weapon.html',
  '/blood.html',
  '/job.html',
  '/fight.html',
  '/Jewelry.html',
  '/magic.html',
  '/magicbook.html',
  '/prop.html',
  '/css/index.css',
  '/css/styles.css',
  '/css/weapon.css',
  '/js/write.js',
  '/js/Armor.js',
  '/js/weapon.js',
  '/js/blood.js',
  '/js/job.js',
  '/js/fight.js',
  '/js/Jewelry.js',
  '/js/magic.js',
  '/js/magicbook.js',
  '/js/prop.js',
  '/img/192.png',
  '/img/512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中 - 返回响应
        if (response) {
          return response;
        }
        return fetch(event.request);
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