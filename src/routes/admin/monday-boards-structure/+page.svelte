<script>
    import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	/**
	 * Parses the settings_str JSON for status or dropdown columns to extract labels.
	 * @param {string} settingsStr - The JSON string from the column settings.
	 * @returns {string[] | null} An array of labels or null if parsing fails or not applicable.
	 */
	function parseSettingsLabels(settingsStr) {
		if (!settingsStr) return null; // Handle cases where settings_str might be null or empty
		try {
			const settings = JSON.parse(settingsStr);
			// Check for status labels (common structure)
			if (settings.labels && typeof settings.labels === 'object' && !Array.isArray(settings.labels)) {
				return Object.values(settings.labels);
			}
			// Check for dropdown labels (another possible structure)
			if (Array.isArray(settings.labels)) {
				return settings.labels.map(/** @param {string | {name: string}} label */ (label) => typeof label === 'object' && label.name ? label.name : label); // Handle potential object structure
			}
			// Add more checks here if other structures are expected (e.g., settings.options for dropdown)
            if (Array.isArray(settings.options)) {
                 return settings.options.map(/** @param {{name: string}} option */ (option) => option.name);
            }
		} catch (e) {
			console.error('Error parsing settings_str:', e, settingsStr);
		}
		return null;
	}
</script>

<svelte:head>
	<title>Monday Boards Structure</title>
</svelte:head>

<div class="container">
	<h1>Monday.com Boards</h1>
	<p>Click on a board to view its detailed structure</p>

	{#if data.boards && data.boards.length > 0}
		<div class="boards-grid">
			{#each data.boards as board (board.id)}
				<a href="/admin/monday-boards-structure/{board.id}" class="board-card">
					<div class="board-header">
						<h2>{board.name}</h2>
						<span class="board-id">ID: {board.id}</span>
					</div>
					<div class="board-stats">
						<div class="stat">
							<span class="stat-number">{board.columns ? board.columns.length : 0}</span>
							<span class="stat-label">Columns</span>
						</div>
						<div class="stat">
							<span class="stat-number">{board.columns ? board.columns.filter(c => c.type === 'status' || c.type === 'dropdown').length : 0}</span>
							<span class="stat-label">Options</span>
						</div>
					</div>
					<div class="board-actions">
						<button 
							class="data-link" 
							on:click={(e) => {
								e.stopPropagation();
								e.preventDefault();
								window.location.href = `/admin/monday-board-data/${board.id}`;
							}}
						>
							View Data
						</button>
					</div>
					<div class="board-arrow">→</div>
				</a>
			{/each}
		</div>
	{:else}
		<p>No boards found or accessible.</p>
	{/if}
</div>

<style>
	.container {
		font-family: sans-serif;
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		background-color: #f8f9fa;
		min-height: 100vh;
		color: #333;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	h1 + p {
		color: #7f8c8d;
		margin-bottom: 2rem;
	}

	.boards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.board-card {
		display: flex;
		flex-direction: column;
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		border: 1px solid #e1e8ed;
		transition: all 0.3s ease;
		position: relative;
	}

	.board-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.15);
		border-color: #3498db;
	}

	.board-header {
		margin-bottom: 1rem;
	}

	.board-header h2 {
		margin: 0 0 0.5rem 0;
		color: #2c3e50;
		font-size: 1.25rem;
	}

	.board-id {
		background-color: #ecf0f1;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.85rem;
		color: #7f8c8d;
		font-family: monospace;
	}

	.board-stats {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.stat-number {
		font-size: 1.5rem;
		font-weight: bold;
		color: #3498db;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.85rem;
		color: #7f8c8d;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.board-arrow {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		font-size: 1.25rem;
		color: #3498db;
		transition: transform 0.3s ease;
	}

	.board-card:hover .board-arrow {
		transform: translateX(4px);
	}

	.board-actions {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #ecf0f1;
	}

	.data-link {
		display: inline-block;
		background: #3498db;
		color: white;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.data-link:hover {
		background: #2980b9;
	}
</style>