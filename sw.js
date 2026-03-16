// Service Worker — Triagem MPPA
// Cache para funcionamento offline básico

const CACHE = 'triagem-mppa-v1';
const ASSETS = [
  '/mppa/',
  '/mppa/index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Para requisições ao Google Sheets (sincronização), sempre vai à rede
  if (e.request.url.includes('script.google.com')) {
    return; // deixa passar normalmente
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cacheia páginas do próprio app
        if (e.request.url.includes('/mppa/')) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/mppa/index.html'));
    })
  );
});
