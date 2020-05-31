const tag = '12';
const $prefix = 'SCONCE';
const $cacheName = `${$prefix}-${tag}`;

const $urls = [
  
  '/sconce/bundle.bfacffd8529898c89cff.js',
  
  '/sconce/javascripts/sconce.efbb980e2fa3900f422a.js',
  
  '/sconce/stylesheets/index.fb0cad18a722a1b252b5.css',
  
  '/sconce/images/icon-152.16a460569578cca83edb.png',
  
  '/sconce/images/icon-167.e8c0e1abca38bc2ee6c6.png',
  
  '/sconce/images/icon-180.678f79f1f40ac2f40ba1.png',
  
  '/sconce/images/icon-192.c30f2a2017130f98365a.png',
  
  '/sconce/images/icon-512.7bc7986d2ed3d788782a.png',
  
  '/sconce/pwa.a7873eb3a74ac0577291.js',
  
  '/sconce/manifest.webmanifest',
  
  '/sconce/index.html',
  
  '/sconce/',
  
];

self.addEventListener('install', async (event) => {
  let cache = await event.waitUntil(caches.open($cacheName));
  await cache.addAll($urls);
})

const clearPreviousCaches = async () => {
  let keys = await caches.keys()
  keys = keys.filter((key) => {
    return (key != $cacheName) && key.startsWith($prefix)
  })
  for (let key of keys) {
   await caches.delete(key);
  }
}

self.addEventListener('activate', (event) => {
  return event.waitUntil(clearPreviousCaches())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open($cacheName).then((cache) => {
      return cache.match(event.request, {ignoreSearch: true})
    }).then((response) => {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
})
