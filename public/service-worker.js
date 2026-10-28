const CACHE_NAME = "little-paper-shell-v3";
const ROOT_URL = "/";
const BUNDLED_FONTS = ["/fonts/AdBhashitha.ttf", "/fonts/maname.ttf"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        try {
          await cache.add(ROOT_URL);
          const shell = await cache.match(ROOT_URL);
          if (!shell) return;
          const html = await shell.text();
          const assets = [...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)]
            .map(match => new URL(match[1], self.location.origin).href);
          await Promise.all([...new Set([...assets, ...BUNDLED_FONTS])].map(asset => cache.add(asset).catch(error => {
            console.warn("Could not pre-cache an application asset.", asset, error);
          })));
        } catch (error) {
          console.warn("Could not pre-cache the app shell; it will cache as files are loaded.", error);
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(async keys => {
        const cache = await caches.open(CACHE_NAME);
        const previousCaches = keys.filter(key => key.startsWith("little-paper-shell-") && key !== CACHE_NAME);
        await Promise.all(previousCaches.map(async key => {
          const previousCache = await caches.open(key);
          const previousCatalog = await previousCache.match("/api/coloring-sheets");
          if (previousCatalog && !await cache.match("/api/coloring-sheets")) {
            await cache.put("/api/coloring-sheets", previousCatalog);
          }
          await caches.delete(key);
        }));
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  let decodedPath = url.pathname;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch (error) {
    console.warn("Could not decode an offline asset path.", url.pathname, error);
  }
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(async response => {
        if (response.ok) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(ROOT_URL, response.clone());
          } catch (error) {
            console.warn("Could not update the cached app shell.", error);
          }
        }
        return response;
      }).catch(async () => (await caches.match(request)) || (await caches.match(ROOT_URL)) || Response.error())
    );
    return;
  }

  if (url.pathname === "/api/coloring-sheets") {
    event.respondWith(
      fetch(request).then(async response => {
        if (response.ok) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          } catch (error) {
            console.warn("Could not update the cached coloring catalog.", error);
          }
        }
        return response;
      }).catch(async () => (await caches.match(request)) || Response.error())
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/starter-art/") ||
      url.pathname === "/bookshop-icon.svg" || url.pathname === "/singlish_core_bg.wasm" ||
      decodedPath.startsWith("/පින්තුර/") || decodedPath.startsWith("/fonts/")) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(async response => {
          if (response.ok) {
            try {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, response.clone());
            } catch (error) {
              console.warn("Could not cache an application resource.", request.url, error);
            }
          }
          return response;
        });
      })
    );
  }
});
