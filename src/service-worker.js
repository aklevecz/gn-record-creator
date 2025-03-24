/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files,  // everything in `static`
	...prerendered // prerendered pages
];

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

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// First check if this is a navigation request
		// and the user is offline
		const isNavigationRequest = event.request.mode === 'navigate';
		// const isOffline = !navigator.onLine;
        const isOffline = true

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