// Deliberately minimal — this exists to satisfy PWA installability
// requirements (a manifest alone isn't enough; Chrome requires a service
// worker with a fetch handler). It does NOT cache API calls or Firestore's
// own network requests — booking/admin data must always be fresh, never
// served stale from cache.

const CACHE_NAME = "groomzy-shell-v1";
const APP_SHELL = ["/", "/services", "/book", "/gallery"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin page navigations — never intercept API routes,
  // Firestore/Firebase Auth network calls, or the Leaflet tile requests.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("/")))
  );
});
