self.addEventListener('install', e => {
    e.waitUntil(caches.open('timers-cache')
    .then(cache => cache.addAll([
        './',
        './index.html',
        './main.css',
        './main.js'
    ])));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request)
    .then(response => (response || fetch(event.request))));
});
