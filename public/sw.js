// Service Worker para PWA Offline & Cache de Assets do Project Ascend
// Estratégia:
// - Navegações (HTML): network-first, com fallback pro cache e depois offline.
//   Assim novas versões publicadas são sempre recebidas.
// - Assets estáticos do Next (/_next/static/, conteúdo com hash): cache-first.
//   Seguro, pois o nome do arquivo muda a cada build.
const CACHE_NAME = 'project-ascend-v2';
const PRECACHE_ASSETS = ['/', '/dashboard', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Apenas métodos GET seguros
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Só tratamos requisições same-origin
  if (url.origin !== self.location.origin) return;

  // Navegações (HTML): network-first para sempre pegar a versão mais nova
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Assets estáticos do Next (hash por build): cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        });
      })
    );
    return;
  }

  // Demais assets (imagens, manifest, etc): stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
