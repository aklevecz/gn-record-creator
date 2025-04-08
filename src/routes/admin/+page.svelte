<script>
    import idb from '$lib/idb';
    import { onMount } from 'svelte';
    const auth = 'kjASDhAUwdhuAHWDuhAWudhaUWhduaHWduhasjkjakl';
    let isDeleting = $state(false);
    let status = $state('');
    /** @type {string[]} */
    let localStorageKeys = $state([]);

    onMount(() => {
        localStorageKeys = Object.keys(localStorage);
    });

    async function handleDeleteDatabase() {
        if (
            !confirm(
                'Are you sure you want to delete the entire database? All stored textures and generated images will be permanently lost.'
            )
        ) {
            return;
        }

        isDeleting = true;
        status = 'Deleting database...';

        try {
            // await idb.recoverDatabase()
            await idb.deleteDatabase();
            localStorage.clear();

            status = 'Database successfully deleted.';

            // Optional: Reinitialize database after deletion
            // await idb.init();
            // status += ' Database has been reinitialized.';
        } catch (/** @type {*} */ error) {
            console.error('Error deleting database:', error);
            status = `Error: ${error.message}`;
        } finally {
            isDeleting = false;
        }
    }

    /** @type {Submission[]} allEntries */
    let allEntries = $state([]);
    onMount(async () => {
        const res = await fetch('/api/survey', { headers: { Authorization: auth } });
        const data = await res.json();
        allEntries = data;
    });

    /** @param {string} key */
    function clearLocalStorageKey(key) {
        localStorage.removeItem(key);
        localStorageKeys = localStorageKeys.filter((k) => k !== key);
        status = `localStorage key "${key}" removed.`;
    }

    function clearAllLocalStorage() {
        localStorage.clear();
        localStorageKeys = [];
        status = 'localStorage cleared.';
    }

    /** @type {string[]} */
    let cookieKeys = $state([]);

    onMount(() => {
        cookieKeys = document.cookie.split(';').map((cookie) => cookie.split('=')[0].trim());
    });

    /** @param {string} key */
    function clearCookieKey(key) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        cookieKeys = cookieKeys.filter((k) => k !== key);
        status = `Cookie "${key}" removed.`;
    }

    function clearAllCookies() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        cookieKeys = [];
        status = 'All cookies cleared.';
    }

    function getCachedFiles() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Create a message channel
            const messageChannel = new MessageChannel();
            // Set up the message handler
            messageChannel.port1.onmessage = (event) => {
                if (event.data && event.data.type === 'CACHE_FILES') {
                    cachedFiles = event.data.payload;
                }
            };

            // Send the message
            navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_FILES' }, [
                messageChannel.port2
            ]);
        }
    }

    /** @type {string[]} */
    let cachedFiles = $state([]);

    onMount(async () => {
        localStorageKeys = Object.keys(localStorage);

        getCachedFiles();
        // Get the list of cached files from the service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'CACHE_FILES') {
                    cachedFiles = event.data.payload;
                }
            });

            navigator.serviceWorker.ready.then((registration) => {
                registration.active?.postMessage({ type: 'GET_CACHE_FILES' });
            });
        }
    });

    /** @param {string} url */
    function clearCacheEntry(url) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                if (event.data && event.data.success) {
                    // Update the UI by removing the deleted file
                    cachedFiles = cachedFiles.filter((file) => file !== url);
                    status = `Cache entry removed.`;
                }
            };

            navigator.serviceWorker.controller.postMessage(
                { type: 'DELETE_CACHE_FILE', payload: url },
                [messageChannel.port2]
            );
        }
    }

    // Function to clear all cache
    function clearAllCache() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                if (event.data && event.data.success) {
                    cachedFiles = [];
                    status = 'Cache cleared.';
                }
            };

            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' }, [
                messageChannel.port2
            ]);
        }
    }

    // /** @param {string} url */
    // function clearCacheEntry(url) {
    //     if ('serviceWorker' in navigator) {
    //         navigator.serviceWorker.ready.then((registration) => {
    //             registration.active?.postMessage({ type: 'DELETE_CACHE_FILE', payload: url });
    //             cachedFiles = cachedFiles.filter((file) => file !== url);
    //             status = `Cache entry "${url}" removed.`;
    //         });
    //     }
    // }

    // function clearAllCache() {
    //     if ('serviceWorker' in navigator) {
    //         navigator.serviceWorker.ready.then((registration) => {
    //             registration.active?.postMessage({ type: 'CLEAR_CACHE' });
    //             cachedFiles = [];
    //             status = 'Cache cleared.';
    //         });
    //     }
    // }
</script>

<div class="database-management">
    <h3>Database Management</h3>

    <h4>localStorage Management</h4>
    <div class="actions">
        <button onclick={clearAllLocalStorage} class="delete-button">
            Clear All localStorage
        </button>
    </div>
    <div class="info">
        <p>This will clear all localStorage data.</p>
    </div>

    {#if localStorageKeys.length > 0}
        <div class="local-storage-entries">
            {#each localStorageKeys as key}
                <div class="local-storage-entry">
                    <span>{key}</span>
                    <button onclick={() => clearLocalStorageKey(key)} class="delete-entry-button"
                        >Remove</button
                    >
                </div>
            {/each}
        </div>
    {:else}
        <p>No localStorage entries found.</p>
    {/if}

    <h4>Cookie Management</h4>
    <div class="actions">
        <button onclick={clearAllCookies} class="delete-button"> Clear All Cookies </button>
    </div>
    <div class="info">
        <p>This will clear all cookies.</p>
    </div>

    {#if cookieKeys.length > 0}
        <div class="local-storage-entries">
            {#each cookieKeys as key}
                <div class="local-storage-entry">
                    <span>{key}</span>
                    <button onclick={() => clearCookieKey(key)} class="delete-entry-button"
                        >Remove</button
                    >
                </div>
            {/each}
        </div>
    {:else}
        <p>No cookies found.</p>
    {/if}

    <!-- {#if 'serviceWorker' in navigator}
        <div class="actions" style="display: none">
            <button onclick={clearAllCache} class="delete-button" style="display: none">
                Clear All Cache
            </button>
        </div>
        <div class="info">
            <p>This will clear all cached files.</p>
        </div>

        {#if cachedFiles.length > 0}
            <div class="local-storage-entries">
                {#each cachedFiles as file}
                    <div class="local-storage-entry">
                        <span>{file}</span>
                        <button onclick={() => clearCacheEntry(file)} class="delete-entry-button"
                            >Remove</button
                        >
                    </div>
                {/each}
            </div>
        {:else}
            <p>No cached files found.</p>
        {/if}
    {/if} -->

    <!-- HIDING CACHE FOR NOW -->
    <!-- <h4>Cache Management</h4>
    <div class="actions">
        <button onclick={getCachedFiles} class="refresh-button"> Refresh Cache List </button>
        <button onclick={clearAllCache} class="delete-button"> Clear All Cache </button>
    </div>

    {#if cachedFiles.length > 0}
        <div class="local-storage-entries">
            {#each cachedFiles as file}
                <div class="local-storage-entry">
                    <span>{file}</span>
                    <button onclick={() => clearCacheEntry(file)} class="delete-entry-button">
                        Remove
                    </button>
                </div>
            {/each}
        </div>
    {:else}
        <p>No cached files found. Click "Refresh Cache List" to check again.</p>
    {/if} -->

    <h4>IndexedDB Management</h4>
    <div class="actions">
        <button onclick={handleDeleteDatabase} disabled={isDeleting} class="delete-button">
            {#if isDeleting}
                <span class="spinner"></span>
                Deleting...
            {:else}
                Delete All IndexedDB Data
            {/if}
        </button>
    </div>

    {#if status}
        <div class="status-message">
            {status}
        </div>
    {/if}

    <div class="info">
        <p>
            This will permanently delete all stored textures and generated images from your browser
            storage.
        </p>
    </div>

    <h3>Survey Entries</h3>
    {#if allEntries.length > 0}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Project Name</th>
                        <th>Contact Name</th>
                        <th>Contact Email</th>
                        <th>Phone</th>
                        <th>Label</th>
                        <th>Artist</th>
                        <th>Catalog Number</th>
                        <th>Release Date</th>
                        <th>Depot Date</th>
                        <th>Shipping Address</th>
                        <th>Shipping Logistics</th>
                        <th>Total Units</th>
                        <th>Records Per Set</th>
                        <th>Record Format</th>
                        <th>Record Color</th>
                        <th>Lacquers</th>
                        <th>Metalwork</th>
                        <th>Test Prints</th>
                        <th>Packaging</th>
                        <th>Notes</th>
                        <th>Status</th>
                        <th>Session</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each allEntries as entry (entry.id)}
                        <tr>
                            <td>{entry.id || 'N/A'}</td>
                            <td>{entry.project_name || 'N/A'}</td>
                            <td>{entry.contact_name || 'N/A'}</td>
                            <td>{entry.contact_email || 'N/A'}</td>
                            <td>{entry.phone || 'N/A'}</td>
                            <td>{entry.label || 'N/A'}</td>
                            <td>{entry.artist || 'N/A'}</td>
                            <td>{entry.catalog_number || 'N/A'}</td>
                            <td>{entry.release_date || 'N/A'}</td>
                            <td>{entry.depot_date || 'N/A'}</td>
                            <td>{entry.shipping_address || 'N/A'}</td>
                            <td>{entry.shipping_logistics || 'N/A'}</td>
                            <td>{entry.total_units || 'N/A'}</td>
                            <td>{entry.records_per_set || 'N/A'}</td>
                            <td>{entry.record_format || 'N/A'}</td>
                            <td>{entry.record_color || 'N/A'}</td>
                            <td>{entry.lacquers || 'N/A'}</td>
                            <td>{entry.metalwork || 'N/A'}</td>
                            <td>{entry.test_prints || 'N/A'}</td>
                            <td>{entry.packaging || 'N/A'}</td>
                            <td>{entry.notes || 'N/A'}</td>
                            <td>{entry.status || 'N/A'}</td>
                            <td>{entry.session || 'N/A'}</td>
                            <td>
                                <button
                                    class="delete-entry-button"
                                    onclick={() => {
                                        if (
                                            confirm(
                                                `Are you sure you want to delete survey ${entry.id}?`
                                            )
                                        ) {
                                            fetch(`/api/survey/${entry.id}`, {
                                                method: 'DELETE',
                                                headers: { Authorization: auth }
                                            })
                                                .then((res) => {
                                                    if (res.ok) {
                                                        allEntries = allEntries.filter(
                                                            (e) => e.id !== entry.id
                                                        );
                                                        status = `Survey ${entry.id} deleted.`;
                                                    } else {
                                                        status = `Error deleting survey ${entry.id}. Status: ${res.status}`;
                                                    }
                                                })
                                                .catch((err) => {
                                                    console.error('Error deleting survey:', err);
                                                    status = `Error deleting survey ${entry.id}: ${err.message}`;
                                                });
                                        }
                                    }}>Delete</button
                                >
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <p>No survey entries found.</p>
    {/if}
</div>

<style>
    .database-management {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #f8f8f8;
        color: black;
    }

    h3 {
        margin-top: 0;
    }

    .actions {
        margin: 1rem 0;
    }

    .delete-button {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .delete-button:hover:not(:disabled) {
        background-color: #c0392b;
    }

    .delete-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .status-message {
        margin: 1rem 0;
        padding: 0.75rem;
        border-radius: 4px;
        background-color: #f1f1f1;
        border-left: 4px solid #3498db;
    }

    .info {
        font-size: 0.9rem;
        color: #666;
    }
    /* Add new styles below existing ones */
    .table-container {
        overflow-x: auto; /* Enable horizontal scrolling */
        margin-top: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        color: black; /* Ensure table text is visible */
    }

    th,
    td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    tr:hover {
        background-color: #f1f1f1;
    }

    .delete-entry-button {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 0.3rem 0.6rem;
        border-radius: 3px;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .delete-entry-button:hover {
        background-color: #c0392b;
    }

    .local-storage-entries {
        margin-top: 1rem;
    }

    .local-storage-entry {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border: 1px solid #ddd;
        margin-bottom: 0.5rem;
        border-radius: 4px;
    }

    /* Add new styles below existing ones */
</style>
