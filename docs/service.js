(function() {
  var $cacheName, $prefix, $urls, clearPreviousCaches, tag;

  tag = '2';

  $prefix = 'SCONCE';

  $cacheName = `${$prefix}-${tag}`;

  $urls = ['/sconce/bundle.7abf80822528893a6122.js', '/sconce/javascripts/sconce.c98af1221d82294f1c65.js', '/sconce/stylesheets/index.2c21db9c4b5d59c0801b.css', '/sconce/images/icon-152.16a460569578cca83edb.png', '/sconce/images/icon-167.e8c0e1abca38bc2ee6c6.png', '/sconce/images/icon-180.678f79f1f40ac2f40ba1.png', '/sconce/images/icon-192.c30f2a2017130f98365a.png', '/sconce/images/icon-512.7bc7986d2ed3d788782a.png', '/sconce/pwa.40e7f83f095c9527ba5d.js', '/sconce/manifest.webmanifest', '/sconce/index.html', '/sconce/'];

  self.addEventListener('install', function(event) {
    return event.waitUntil(caches.open($cacheName).then(function(cache) {
      return cache.addAll($urls);
    }));
  });

  clearPreviousCaches = async function() {
    var keys;
    keys = (await caches.keys());
    return Promise.all(keys.filter(function(key) {
      return key !== $cacheName && key.startsWith($prefix);
    }).map(function(key) {
      return caches.delete(key);
    }));
  };

  self.addEventListener('activate', function(event) {
    return event.waitUntil(clearPreviousCaches);
  });

  self.addEventListener('fetch', function(event) {
    return event.respondWith(caches.open($cacheName).then(function(cache) {
      return cache.match(event.request, {
        ignoreSearch: true
      });
    }).then(function(response) {
      return response || fetch(event.request);
    }));
  });

  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      return self.skipWaiting();
    }
  });

}).call(this);
