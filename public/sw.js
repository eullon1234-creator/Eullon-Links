const CACHE_NAME = "eullon-links-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ignorar requisições não-GET e requisições externas (como Firebase Auth/Firestore)
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Cachear apenas arquivos de origem local
  if (url.origin !== self.location.origin) return;

  // Ignorar chamadas de hot reload do Vite no ambiente de desenvolvimento
  if (url.pathname.includes("@vite") || url.pathname.includes("node_modules")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Busca atualização em segundo plano para o próximo carregamento
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Fallback para index.html se for uma navegação e falhar offline
          if (event.request.mode === "navigate") {
            return caches.match("./index.html") || caches.match("/");
          }
        });
    })
  );
});
