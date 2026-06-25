const SHARE_CACHE = 'docmind-share-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept the Web Share Target POST to /share
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  // All other requests: use network (no-op)
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (file && file instanceof File) {
      // Store the file in Cache Storage so the /share page can read it
      const arrayBuffer = await file.arrayBuffer();
      const cache = await caches.open(SHARE_CACHE);
      await cache.put('/pending-share', new Response(arrayBuffer, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-File-Name': encodeURIComponent(file.name),
          'X-File-Size': String(file.size),
        }
      }));
    }
  } catch (err) {
    console.error('[SW] Share target error:', err);
  }

  // Redirect to the share UI page
  return Response.redirect('/share', 303);
}
