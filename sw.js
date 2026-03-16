// Service Worker — Triagem MPPA v2
const CACHE = 'triagem-mppa-v2';
const GS_URL = 'https://script.google.com/macros/s/AKfycbwY9TO6Cr2Vy3SLtwk1Kxrwtcc3O_k7bVbeSrJc7YjBWJc_vSE5gqiGmHAuXi4dRcO/exec';

const ASSETS = [
  '/mppa/',
  '/mppa/index.html',
  '/mppa/manifest.json',
  '/mppa/icon-192.png',
  '/mppa/icon-512.png',
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
  // Deixa Google Sheets e Anthropic API passar direto
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('anthropic.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Atualiza cache com versão nova
        if (e.request.url.includes('/mppa/')) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// Ao instalar o app, injeta a URL do Apps Script no cliente
self.addEventListener('message', e => {
  if (e.data === 'GET_GS_URL') {
    e.ports[0].postMessage(GS_URL);
  }
});
