// background-sync.js
// A client-side API for working with offline requests

/**
 * Gets the status of pending offline requests
 *
 * @returns {Promise<{pending: number, error?: *}>} The number of pending requests
 */
export async function getPendingRequestsCount() {
    try {
        const db = await openDatabase();
        const count = await getOutboxCount(db);
        db.close();
        return { pending: count };
    } catch (/** @type {*} */ error) {
        console.error('Error getting pending requests count:', error);
        return { pending: 0, error: error.message };
    }
}

/**
 * Manually trigger a sync attempt if the browser supports it
 *
 * @returns {Promise<boolean>} Whether the sync registration was successful
 */
export async function attemptSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            // @ts-ignore
            await registration.sync.register('outbox');
            return true;
        } catch (error) {
            console.error('Sync registration failed:', error);
            return false;
        }
    }
    return false;
}

/**
 * Check if the browser supports background sync
 *
 * @returns {boolean} Whether background sync is supported
 */
export function isBackgroundSyncSupported() {
    return 'serviceWorker' in navigator && 'SyncManager' in window;
}

// Helper functions for IndexedDB (duplicated from service worker for client use)
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('OfflineRequests', 1);

        request.onupgradeneeded = (/** @type {*} */ event) => {
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

        request.onsuccess = (/** @type {*} */ event) => resolve(event.target.result);
        request.onerror = (/** @type {*} */ event) =>
            reject(new Error('Database error: ' + event.target.errorCode));
    });
}

/** @param {IDBDatabase} db */
function getOutboxCount(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['outbox'], 'readonly');
        const store = transaction.objectStore('outbox');
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (/** @type {*} */ event) =>
            reject(new Error('Error getting outbox count: ' + event.target.errorCode));
    });
}

/**
 * Get all pending requests in the outbox
 *
 * @returns {Promise<Array<any>>} Array of pending requests
 */
export async function getPendingRequests() {
    try {
        const db = await openDatabase();
        const items = await getOutboxItems(db);
        db.close();
        return items;
    } catch (error) {
        console.error('Error getting pending requests:', error);
        return [];
    }
}

/** @param {IDBDatabase} db */
function getOutboxItems(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['outbox'], 'readonly');
        const store = transaction.objectStore('outbox');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (/** @type {*} */ event) =>
            reject(new Error('Error getting outbox items: ' + event.target.errorCode));
    });
}
