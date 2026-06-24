self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // This empty fetch listener is strictly required by Google Chrome
  // to trigger the automatic "Add to Home Screen" install prompt.
});
