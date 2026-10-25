// Lounge Finder offline support: the app works without signal; rules.json always tries the network first.
const CACHE = "lounge-finder-v1";
const SHELL = ["./", "index.html", "rules.json", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Network first for everything on this site (so updates show right away), cached copy when offline.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); const key = url.pathname.endsWith("rules.json") ? "rules.json" : e.request; caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(url.pathname.endsWith("rules.json") ? "rules.json" : e.request).then(r => r || caches.match("index.html")))
  );
});
