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
	onMount(() => {
		data.boards.forEach(element => {
				console.log(element.name)
		});
	})
</script>

<svelte:head>
	<title>Monday Boards Structure</title>
</svelte:head>

<div class="container">
	<h1>Monday.com Boards Structure</h1>

	{#if data.boards && data.boards.length > 0}
		{#each data.boards as board (board.id)}
			<section class="board-section">
				<h2>{board.name}</h2>
				<p>Board ID: <code>{board.id}</code></p>

				{#if board.columns && board.columns.length > 0}
					<h3>Columns / Fields</h3>
					<table>
						<thead>
							<tr>
								<th>Title</th>
								<th>ID</th>
								<th>Type</th>
								<th>Settings / Options</th>
							</tr>
						</thead>
						<tbody>
							{#each board.columns as column (column.id)}
								<tr>
									<td>{column.title}</td>
									<td><code>{column.id}</code></td>
									<td>{column.type}</td>
									<td>
										{#if column.type === 'status' || column.type === 'dropdown'}
											{@const labels = parseSettingsLabels(column.settings_str)}
											{#if labels && labels.length > 0}
												<ul>
													{#each labels as label}
														<li>{label}</li>
													{/each}
												</ul>
											{:else if labels}
												<small>No options defined.</small>
                                            {:else}
												<small>Could not parse options.</small>
											{/if}
										{:else}
											<small>N/A</small>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p>No columns found for this board.</p>
				{/if}
			</section>
		{/each}
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
	}
	h1 {
		border-bottom: 1px solid #ccc;
		padding-bottom: 0.5rem;
		margin-bottom: 1.5rem;
	}
    .board-section {
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
	h2 {
		border-bottom: 1px solid #eee;
		padding-bottom: 0.5rem;
		margin-top: 0;
        margin-bottom: 0.5rem;
	}
    h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}
	th,
	td {
		border: 1px solid #ddd;
		padding: 0.6rem;
		text-align: left;
		vertical-align: top;
        font-size: 0.9rem;
	}
	th {
	}
	code {
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-size: 85%;
        word-break: break-all;
	}
	ul {
		padding-left: 15px;
		margin-top: 0.3rem;
        margin-bottom: 0;
        list-style: disc;
	}
	li {
		margin-bottom: 0.2rem;
	}
	small {
		color: #777;
        font-style: italic;
	}
</style>