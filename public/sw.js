// Minimal app-shell service worker for the browser-preview PWA install
// experience. Deliberately narrow in scope: it caches same-origin static
// assets (HTML/JS/CSS/icons) with a stale-while-revalidate strategy so the
// installed app shell opens offline. It never intercepts blob:/data: URLs
// or IndexedDB-backed photo data — those aren't network requests to begin
// with, since the app's real photo storage lives in IndexedDB, not behind
// a fetchable URL this worker could see.
const CACHE_NAME = 'todays-memory-shell-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => {
          if (cached) return cached
          if (request.mode === 'navigate') return cache.match('./index.html')
          return Response.error()
        })
      return cached || networkFetch
    }),
  )
})
