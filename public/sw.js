// Service worker mínimo: habilita la instalación como app sin cachear respuestas,
// así cada despliegue se sirve siempre desde la red.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {})
