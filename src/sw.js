import State from './State.js';

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

self.addEventListener('activate', event => {
  globalThis.addEventListener('timer.finished', event => {
    console.log(event);
    sendTimerNotification(event.timer);
  });
});

function sendTimerNotification(timer) {
  self.registration.showNotification("Timers", {
    body: `Timer "${timer.title}" is done.`,
    vibrate: true,
    requireInteraction: true,
    actions: [
      {
        action: 'stop',
        title: 'Stop'
      }
    ]
  });

  self.addEventListener('notificationclick', event => {
    event.notification.close();
  }, false);
}
