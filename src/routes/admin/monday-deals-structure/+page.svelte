<script>
	/** @type {import('./$types').PageData} */
	export let data;

	/**
	 * Parses the settings_str JSON for status or dropdown columns to extract labels.
	 * @param {string} settingsStr - The JSON string from the column settings.
	 * @returns {string[] | null} An array of labels or null if parsing fails or not applicable.
	 */
	function parseSettingsLabels(settingsStr) {
		try {
			const settings = JSON.parse(settingsStr);
			// Check for status labels (common structure)
			if (settings.labels && typeof settings.labels === 'object') {
				return Object.values(settings.labels);
			}
			// Check for dropdown labels (another possible structure)
			if (Array.isArray(settings.labels)) {
				return settings.labels.map(/** @param {string | {name: string}} label */ (label) => typeof label === 'object' && label.name ? label.name : label); // Handle potential object structure
			}
			// Add more checks here if other structures are expected
		} catch (e) {
			console.error('Error parsing settings_str:', e, settingsStr);
		}
		return null;
	}
</script>

<svelte:head>
	<title>Monday Deals Board Structure</title>
</svelte:head>

<div class="container">
	<h1>Monday.com Deals Board Structure</h1>
	<p>Board ID: {data.columns.length > 0 ? data.columns[0]?.board?.id || 'N/A' : 'N/A'}</p>

	<section>
		<h2>Groups / Stages</h2>
		{#if data.groupTitles && Object.keys(data.groupTitles).length > 0}
			<ul>
				{#each Object.entries(data.groupTitles) as [id, title]}
					<li>{title} (<code>{id}</code>)</li>
				{/each}
			</ul>
		{:else}
			<p>No group titles found.</p>
		{/if}
	</section>

	<section>
		<h2>Columns / Fields</h2>
		{#if data.columns && data.columns.length > 0}
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
					{#each data.columns as column (column.id)}
						<tr>
							<td>{column.title}</td>
							<td><code>{column.id}</code></td>
							<td>{column.type}</td>
							<td>
								{#if column.type === 'status' || column.type === 'dropdown'}
									{@const labels = parseSettingsLabels(column.settings_str)}
									{#if labels}
										<ul>
											{#each labels as label}
												<li>{label}</li>
											{/each}
										</ul>
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
</div>

<style>
	.container {
		font-family: sans-serif;
		padding: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}
	h1,
	h2 {
		border-bottom: 1px solid #eee;
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
	}
	section {
		margin-bottom: 2rem;
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
	}
	th {
		/* background-color: #f2f2f2; */
	}
	code {
		/* background-color: #eee; */
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-size: 85%;
	}
	ul {
		padding-left: 20px;
		margin-top: 0.5rem;
	}
	li {
		margin-bottom: 0.3rem;
	}
	small {
		color: #666;
	}
</style>