<script>
    import idb from '$lib/idb';
    import { onMount } from 'svelte';
    const auth = 'kjASDhAUwdhuAHWDuhAWudhaUWhduaHWduhasjkjakl';
    let isDeleting = false;
    let status = '';

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
            await fetch('/api/auth', {
                method: 'DELETE'
            });
            // delete session cookie
            document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

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
</script>

<div class="database-management">
    <h3>Database Management</h3>

    <div class="actions">
        <button onclick={handleDeleteDatabase} disabled={isDeleting} class="delete-button">
            {#if isDeleting}
                <span class="spinner"></span>
                Deleting...
            {:else}
                Delete All Data
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

    <div class="entries">
        {#each allEntries as entry}
            <div class="entry mb-4 flex items-center gap-2">
                <div>{entry.id}</div>
                <button
                    onclick={() => {
                        fetch(`/api/survey/${entry.id}`, { method: 'DELETE', headers: { Authorization: auth } });
                    }}>Delete</button
                >
            </div>
        {/each}
    </div>
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
</style>
