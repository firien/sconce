const tag = '14';
const prefix = 'SCONCE';
const cacheName = `${prefix}-${tag}`;

const urls = [
  "/sconce/javascripts/sconce-DEBGUWG5.js.map",
  "/sconce/javascripts/sconce-DEBGUWG5.js",
  "/sconce/stylesheets/index-WJYZCOO7.css.map",
  "/sconce/stylesheets/index-WJYZCOO7.css",
  "/sconce/images/icon-152-RSA4C27D.png",
  "/sconce/images/icon-167-J3OTMXMN.png",
  "/sconce/images/icon-180-EISXTVDE.png",
  "/sconce/images/icon-192-QIZSH6VW.png",
  "/sconce/images/icon-512-L6ILOTZJ.png"
];

self.addEventListener('install', async (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => {
    return cache.addAll(urls);
  }))
})

const clearPreviousCaches = async () => {
  let keys = await caches.keys()
  keys = keys.filter((key) => {
    return (key != cacheName) && key.startsWith(prefix)
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
    caches.open(cacheName).then((cache) => {
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
