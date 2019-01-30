(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service.js', {
      scope: '/'
    }).then(function(registration) {
      var refreshPage;
      refreshPage = function(worker) {
        if (worker.state !== 'activated') {
          worker.postMessage({
            action: 'skipWaiting'
          });
        }
        return window.location.reload();
      };
      if (registration.waiting) {
        refreshPage(registration.waiting);
      }
      return registration.addEventListener('updatefound', function() {
        var newWorker;
        newWorker = registration.installing;
        return newWorker.addEventListener('statechange', function() {
          if (newWorker.state === 'installed') {
            return refreshPage(newWorker);
          }
        });
      });
    });
  }

  window.addEventListener('beforeinstallprompt', function(e) {
    var button, deferredInstall;
    // necessary?
    e.preventDefault();
    deferredInstall = e;
    button = document.createElement('button');
    button.setAttribute('id', 'installer');
    button.textContent = 'Install';
    button.addEventListener('click', function() {
      deferredInstall.prompt();
      return deferredInstall.userChoice.finally(function() {
        deferredInstall = null;
        return document.body.removeChild(button);
      });
    });
    return document.body.appendChild(button);
  });

}).call(this);
