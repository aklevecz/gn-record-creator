// static/service-worker.js
const CACHE_NAME = 'svelte-kit-offline-v2';

// Install event - precache the essential static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`Service worker installed with cache: ${CACHE_NAME}`);
        return cache.addAll([
          '/', // Root path - SvelteKit will handle this
          '/favicon.png'
        ]);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('svelte-kit-offline-'))
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  
  // Claim any clients immediately
  return self.clients.claim();
});

// Fetch event - dynamic caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (
    event.request.method !== 'GET' || 
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.includes('extension/') ||
    event.request.url.includes('__vite')
  ) {
    return;
  }

  // For HTML navigation requests, try network first, then fall back to root path
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/') // Use the root path as fallback
            .then(response => response || new Response('You are offline', {
              headers: { 'Content-Type': 'text/html' }
            }));
        })
    );
    return;
  }

  // For app assets (files in /_app/), use cache-first strategy
  if (event.request.url.includes('/_app/')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  })
                  .catch(err => console.warn('Cache error:', err));
              }
              return response;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              return new Response('Network error', { status: 408 });
            });
        })
    );
    return;
  }

  // For all other requests, use stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response immediately
        if (cachedResponse) {
          // Fetch from network in the background to update cache
          fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  })
                  .catch(err => console.warn('Background cache update failed:', err));
              }
            })
            .catch(() => {/* Ignore network errors during background updates */});
          
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response to cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.warn('Cache put error:', err));

            return response;
          })
          .catch(error => {
            console.error('Fetch error:', error);
            
            // For image requests, return a placeholder
            if (event.request.destination === 'image') {
              return new Response('', { status: 200 });
            }
            
            throw error;
          });
      })
  );
});

// Listen for page navigations to save visited URLs for offline access
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.payload.urls))
    );
  }
});