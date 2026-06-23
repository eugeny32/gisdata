// Минимальный service worker — нужен Chrome для критерия "installable"
// (манифест + SW с обработчиком fetch). Кэш только статики оболочки;
// API/станции/туры всегда идут в сеть (онлайн-данные, кэшировать их не нужно).
const CACHE_NAME = 'gisdata-shell-v1';
const SHELL_URLS = ['/manifest.json', '/assets/style.css', '/assets/icon-192.png', '/assets/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
