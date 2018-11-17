if 'serviceWorker' of navigator
  navigator.serviceWorker.register('/sconce/service.js', scope: '/sconce/').then((registration) ->
    refreshPage = (worker) ->
      if worker.state != 'activated'
        worker.postMessage(action: 'skipWaiting')
      window.location.reload()
    if registration.waiting
      refreshPage(registration.waiting)
    registration.addEventListener('updatefound', ->
      newWorker = registration.installing
      newWorker.addEventListener('statechange', ->
        if newWorker.state == 'installed'
          refreshPage(newWorker)
      )
    )
  )

window.addEventListener('beforeinstallprompt', (e) ->
  # necessary?
  e.preventDefault()
  deferredInstall = e
  button = document.createElement('button')
  button.setAttribute('id', 'installer')
  button.textContent = 'Install'
  button.addEventListener('click', ->
    deferredInstall.prompt()
    deferredInstall.userChoice.finally( ->
      deferredInstall = null
      document.body.removeChild(button)
    )
  )
  document.body.appendChild(button)
)
