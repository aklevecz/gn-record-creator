<script>
    import ConfirmationModal from '$lib/components/project/confirmation-modal.svelte';
    import { invalidate } from '$app/navigation';

    /** @type {{data:import('./$types').PageData}} */
    const { data } = $props();

    let confirmationModalOpen = $state(false);
    /** @type {string | null} */
    let itemIdToDelete = $state(null);

    /**
     * @param {{ column_values: any[] }} item
     * @param {string} columnId
     */
    function getColumnValue(item, columnId) {
        const columnValue = item.column_values.find(/** @param {{ column: { id: string }}} cv */ (cv) => cv.column.id === columnId);
        return columnValue ? columnValue.text || columnValue.value : '';
    }

    /** @param {string} itemId*/
    function handleDelete(itemId) {
        itemIdToDelete = itemId;
        confirmationModalOpen = true;
    }

    async function confirmDelete() {
        const itemId = itemIdToDelete;
        console.log('Deleting item with ID:', itemId);

        try {
            const response = await fetch('/api/monday/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemId })
            });

            if (response.ok) {
                // Item deleted successfully, refresh the data
                console.log('Item deleted successfully');
                await invalidate(`admin/monday-board-data/${data.board.id}`);
            } else {
                // Handle error
                console.error('Error deleting item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }

        confirmationModalOpen = false;
    }
</script>

<svelte:head>
    <title>{data.board.name} Data</title>
</svelte:head>

<div class="container">
    <h1>{data.board.name} Data</h1>
    <p>Board ID: <code>{data.board.id}</code></p>

    {#if data.board.items_page.items && data.board.items_page.items.length > 0}
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    {#each data.board.columns as column (column.id)}
                        <th>{column.title}</th>
                    {/each}
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each data.board.items_page.items as item (item.id)}
                    <tr>
                        <td>{item.name}</td>
                        {#each data.board.columns as column (column.id)}
                            <td>{getColumnValue(item, column.id)}</td>
                        {/each}
                        <td>
                            {item.id}
                        </td>
                        <td>
                            <button onclick={() => handleDelete(item.id)}>Delete</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p>No items found on this board.</p>
    {/if}

    <ConfirmationModal
        isOpen={confirmationModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => (confirmationModalOpen = false)}
    />
</div>

<style>
    .container {
        font-family: sans-serif;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    h1 {
        border-bottom: 1px solid #ccc;
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    th,
    td {
        border: 1px solid #ddd;
        padding: 0.5rem;
        text-align: left;
        vertical-align: top;
        height: 2rem; /* Adjust as needed */
        white-space: nowrap;
        overflow: hidden;
        max-width: 200px; /* Adjust as needed */
    }
    code {
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 85%;
    }
</style>
