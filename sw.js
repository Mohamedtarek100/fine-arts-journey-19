/* =========================================================================
 *  الرحلة — PARIS & MUSÉE DU LOUVRE 3D SERVICE WORKER (v29)
 *  - Cache-First (yomna-assets-v1) for heavy immutable 3D assets
 *    (.glb, .hdr, .wasm, .webp, .jpg, .jpeg, .png, .mp3, .svg)
 *  - Network-First (yomna-shell-v1) for HTML, JS, CSS & manifest
 *    so code updates appear immediately while remaining offline-resilient
 *  - GitHub Pages subpath-safe (./) • Bypasses Firebase & cross-origin APIs
 * ========================================================================= */

const ASSET_CACHE = 'yomna-assets-v1';
const SHELL_CACHE = 'yomna-shell-v1';

const HEAVY_ASSET_RE = /\.(glb|gltf|hdr|wasm|webp|jpe?g|png|mp3|ogg|svg)$/i;
const SHELL_ASSET_RE = /(\/|\.(html?|js|css|webmanifest))$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(['./', './index.html', './manifest.webmanifest']).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== ASSET_CACHE && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin requests; never intercept Firebase/Firestore or external fonts
  if (url.origin !== self.location.origin) return;

  // 1. Heavy Immutable 3D Assets -> Cache-First
  if (HEAVY_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(req, { ignoreSearch: false });
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok && fresh.status === 200) {
            cache.put(req, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (err) {
          const fallback = await cache.match(req, { ignoreSearch: true });
          if (fallback) return fallback;
          throw err;
        }
      })
    );
    return;
  }

  // 2. App Shell (HTML, JS, CSS, Manifest) -> Network-First
  if (req.mode === 'navigate' || SHELL_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok && fresh.status === 200) {
            cache.put(req, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          const cached = await cache.match(req, { ignoreSearch: true });
          if (cached) return cached;
          if (req.mode === 'navigate') {
            const indexFallback = await cache.match('./index.html', { ignoreSearch: true });
            if (indexFallback) return indexFallback;
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })
    );
  }
});
