/* Deadweight service worker: lets the game be installed as an app and keeps
   "Play offline vs bots" working with no internet. Always tries the network first,
   so updates arrive immediately. Never touches the WebSocket game connection. */
const CACHE = 'deadweight-v8';
const SHELL = ['/', '/engine.js', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname === '/health' || u.pathname === '/info' || u.pathname === '/rooms') return;
  e.respondWith(
    fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match('/')))
  );
});
