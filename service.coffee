tag = 1
$prefix = 'SCONCE'
$cacheName = "#{$prefix}-#{tag}"

$urls = [
  '/sconce/favicon.png'
  '/sconce/icon-192.png'
  '/sconce/icon-512.png'
  '/sconce/touch-icon-ipad.png'
  '/sconce/touch-icon-ipad-retina.png'
  '/sconce/touch-icon-iphone-retina.png'
  '/sconce/index.css'
  '/sconce/pwa.js'
  '/sconce/sconce.js'
  '/sconce/bundle.js'
  '/sconce/index.html'
  '/sconce/'
]

self.addEventListener('install', (event) ->
  event.waitUntil(caches.open($cacheName).then((cache) ->
    cache.addAll($urls)
  ))
)

clearPreviousCaches = ->
  keys = await caches.keys()
  Promise.all(keys.filter((key) ->
    key != $cacheName and key.startsWith($prefix)
  ).map((key) ->
    caches.delete(key)
  ))

self.addEventListener('activate', (event) ->
  event.waitUntil(clearPreviousCaches)
)

self.addEventListener('fetch', (event) ->
  event.respondWith(
    caches.open($cacheName).then((cache) ->
      cache.match(event.request, ignoreSearch: true)
    ).then((response) ->
      response || fetch(event.request)
    )
  )
)

self.addEventListener('message', (event) ->
  if event.data.action == 'skipWaiting'
    self.skipWaiting()
)
