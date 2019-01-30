(function() {
  var $cacheName, $prefix, $urls, clearPreviousCaches, tag;

  tag = '7';

  $prefix = 'SCONCE';

  $cacheName = `${$prefix}-${tag}`;

  $urls = ['bundle.1adc7297d4b2947102c3.js', 'javascripts/sconce.a8a2472c8aaaaf18df3b.js', 'stylesheets/index.c56cc23b7c00453c7d6c.css', 'images/icon-152.16a460569578cca83edb.png', 'images/icon-167.e8c0e1abca38bc2ee6c6.png', 'images/icon-180.678f79f1f40ac2f40ba1.png', 'images/icon-192.c30f2a2017130f98365a.png', 'images/icon-512.7bc7986d2ed3d788782a.png', 'pwa.ad29d7b873628beaef78.js', 'manifest.webmanifest', 'index.html', '/'];

  self.addEventListener('install', function(event) {
    return event.waitUntil(caches.open($cacheName).then(function(cache) {
      return cache.addAll($urls);
    }));
  });

  clearPreviousCaches = function() {
    return caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(key) {
        return (key !== $cacheName) && key.startsWith($prefix);
      }).map(function(key) {
        return caches.delete(key);
      }));
    });
  };

  self.addEventListener('activate', function(event) {
    return event.waitUntil(clearPreviousCaches());
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
