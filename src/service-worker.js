/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
    ...build, // the app itself
    ...files, // everything in `static`
    ...prerendered // prerendered pages
];

const QUEUE_NAME = 'outbox';

self.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

self.addEventListener('sync', (event) => {
    if (event.tag === QUEUE_NAME) {
        event.waitUntil(syncOutbox());
    }
});

async function syncOutbox() {
    try {
        // Open IndexedDB
        const db = await openDatabase();
        const outbox = await getOutboxItems(db);

        // Process each request in the outbox
        const requests = await Promise.all(
            outbox.map(async (item) => {
                try {
                    // Recreate the request from stored data
                    const request = new Request(item.url, {
                        method: item.method,
                        headers: item.headers,
                        body: item.body,
                        mode: 'cors',
                        credentials: 'include'
                    });

                    // Send the request
                    const response = await fetch(request);

                    // If successful, remove from outbox
                    if (response.ok) {
                        await deleteOutboxItem(db, item.id);
                        return { success: true, itemId: item.id };
                    } else {
                        console.error(
                            'Failed to sync request:',
                            response.status,
                            response.statusText
                        );
                        return {
                            success: false,
                            itemId: item.id,
                            error: `Status ${response.status}`
                        };
                    }
                } catch (error) {
                    console.error('Error processing outbox item:', error);
                    return { success: false, itemId: item.id, error: error.message };
                }
            })
        );

        // Close database connection
        db.close();

        return requests;
    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    }
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('OfflineRequests', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('outbox')) {
                const store = db.createObjectStore('outbox', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('url', 'url', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(new Error('Database error: ' + event.target.errorCode));
    });
}

function getOutboxItems(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['outbox'], 'readonly');
        const store = transaction.objectStore('outbox');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) =>
            reject(new Error('Error getting outbox items: ' + event.target.errorCode));
    });
}

async function saveRequestToOutbox(request) {
    // Clone the request first to extract the body
    const requestClone = request.clone();
    let body = null;

    // Extract body if present
    if (['POST', 'PUT', 'PATCH'].includes(requestClone.method)) {
        try {
            // Try to get the body as text
            body = await requestClone.text();
        } catch (error) {
            console.error('Could not clone request body', error);
        }
    }

    // Convert headers to plain object
    const headers = {};
    requestClone.headers.forEach((value, key) => {
        headers[key] = value;
    });

    // Create outbox item
    const outboxItem = {
        url: requestClone.url,
        method: requestClone.method,
        headers: headers,
        body: body,
        timestamp: Date.now()
    };

    // Only open DB connection after all async operations are complete
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['outbox'], 'readwrite');
        const store = transaction.objectStore('outbox');

        const addRequest = store.add(outboxItem);

        addRequest.onsuccess = () => {
            resolve(addRequest.result);
        };

        addRequest.onerror = (event) => {
            reject(new Error('Error saving request: ' + event.target.errorCode));
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = (event) => {
            db.close();
            reject(new Error('Transaction error: ' + event.target.errorCode));
        };
    });
}

function deleteOutboxItem(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['outbox'], 'readwrite');
        const store = transaction.objectStore('outbox');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) =>
            reject(new Error('Error deleting outbox item: ' + event.target.errorCode));
    });
}

function shouldQueueRequest(request) {
    // Queue non-GET requests to your API endpoints
    // Customize this logic based on your app's needs

    // Only handle POST, PUT, DELETE, PATCH methods
    const queueableMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    return (
        queueableMethods.includes(request.method) &&
        // Only queue API requests
        request.url.includes('/api/') &&
        // Only queue JSON requests or form data
        (request.headers.get('content-type')?.includes('application/json') ||
            request.headers.get('content-type')?.includes('form'))
    );
}

self.addEventListener('fetch', (event) => {
    // Check if this is a request that should be queued when offline
    if (shouldQueueRequest(event.request)) {
        // If offline, queue the request and return a success response
        if (!navigator.onLine) {
            event.respondWith(
                (async () => {
                    await saveRequestToOutbox(event.request.clone());
                    // Register for background sync
                    await self.registration.sync.register(QUEUE_NAME);
                    // Return a "request queued" response
                    return new Response(
                        JSON.stringify({
                            success: true,
                            message:
                                'Your request has been queued and will be sent when you are back online.'
                        }),
                        {
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })()
            );
            return;
        }
    }
    // ignore POST requests etc
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // First check if this is a navigation request
        // and the user is offline
        const isNavigationRequest = event.request.mode === 'navigate';
        const isOffline = !navigator.onLine;

        // For navigation requests when offline, try the cache first
        // instead of trying network first (which will fail)
        if (isNavigationRequest && isOffline) {
            // Try to get the response from the cache
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) return cachedResponse;

            // If not found, check for a cached index page
            const indexResponse = await cache.match('/');
            if (indexResponse) return indexResponse;
        }

        // For static assets, always serve from cache if available
        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);
            if (response) {
                return response;
            }
        }

        // For other requests, try the network first
        // But catch errors properly
        try {
            const response = await fetch(event.request);

            // Cache successful responses
            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch (err) {
            console.error('Fetch failed:', err);

            // Try to get from cache
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            // If it's a navigation request and nothing in cache,
            // try to return the index page as a fallback
            if (isNavigationRequest) {
                const indexResponse = await cache.match('/');
                if (indexResponse) {
                    return indexResponse;
                }
            }

            // Nothing we can do, rethrow the error
            throw err;
        }
    }

    event.respondWith(respond());
});

self.addEventListener('message', async (event) => {
    // Make sure we have a port to respond to
    console.log(event)
    if (!event.ports || event.ports.length === 0) return;

    const port = event.ports[0];

    if (event.data.type === 'GET_CACHE_FILES') {
        console.log('Getting cache files');
        const cache = await caches.open(CACHE);
        const keys = await cache.keys();
        const urls = keys.map((key) => key.url);

        // Send the list back through the message port
        port.postMessage({
            type: 'CACHE_FILES',
            payload: urls
        });
    }

    if (event.data.type === 'DELETE_CACHE_FILE') {
        const url = event.data.payload;
        const cache = await caches.open(CACHE);
        const result = await cache.delete(url);

        // Respond with success status
        port.postMessage({
            success: result,
            type: 'CACHE_FILE_DELETED'
        });
    }

    if (event.data.type === 'CLEAR_CACHE') {
        const result = await caches.delete(CACHE);
        // Recreate the cache for future use
        await caches.open(CACHE);

        // Respond with success status
        port.postMessage({
            success: result,
            type: 'CACHE_CLEARED'
        });
    }
});
