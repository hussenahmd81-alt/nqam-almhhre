const CACHE_PREFIX = 'lamasat-almeamar';
const CACHE_VERSION = 'v3';
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const APP_ROOT = new URL('./', self.registration.scope).href;
const PRECACHE_URLS = [
  APP_ROOT,
  new URL('manifest.webmanifest', APP_ROOT).href,
  new URL('icons/icon.svg', APP_ROOT).href,
  new URL('icons/icon-192.png', APP_ROOT).href,
  new URL('icons/icon-512.png', APP_ROOT).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(async (cache) => {
        await cache.addAll(PRECACHE_URLS);
        const page = await cache.match(APP_ROOT);
        const html = await page.text();
        const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
          .map((match) => new URL(match[1], APP_ROOT))
          .filter((url) => url.origin === self.location.origin && /\.(js|css)$/.test(url.pathname));
        await cache.addAll(assets.map((url) => url.href));
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(APP_ROOT, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(APP_ROOT)) || Response.error();
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (['script', 'style', 'image', 'font', 'manifest'].includes(request.destination)) {
    event.respondWith(cacheFirstAsset(request));
  }
});
