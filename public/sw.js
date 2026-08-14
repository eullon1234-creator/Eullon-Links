const CACHE_NAME = "eullon-links-v2";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon16.png",
  "./icon48.png",
  "./icon128.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Alguns assets estáticos falharam no pre-cache inicial:", err);
      });
    })
  );
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
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Não interceptar requisições externas de APIs (Microlink, Firebase, Google APIs)
  if (url.origin !== self.location.origin) return;

  // Ignorar módulos de desenvolvimento do Vite se estiver em dev
  if (url.pathname.includes("@vite") || url.pathname.includes("node_modules")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Busca da rede em segundo plano para atualizar o cache
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Se for navegação de página e a rede falhar, fallback para index.html em cache
          if (event.request.mode === "navigate") {
            return caches.match("./index.html") || caches.match("./");
          }
        });

      return cachedResponse || networkFetch;
    })
  );
});
