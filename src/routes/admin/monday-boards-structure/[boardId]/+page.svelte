<script>
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

	function getFieldTypeColor(type) {
		const colors = {
			'text': '#3498db',
			'email': '#e74c3c',
			'phone': '#9b59b6',
			'date': '#f39c12',
			'status': '#95a5a6',
			'dropdown': '#34495e',
			'long_text': '#16a085',
			'number': '#e67e22',
			'name': '#8e44ad'
		};
		return colors[type] || '#7f8c8d';
	}
</script>

<svelte:head>
	<title>Board {data.board.name} - Monday Structure</title>
</svelte:head>

<div class="container">
	<div class="header">
		<a href="/admin/monday-boards-structure" class="back-link">← Back to Boards</a>
		<h1>{data.board.name}</h1>
		<div class="board-meta">
			<span class="board-id">Board ID: <code>{data.board.id}</code></span>
			<span class="column-count">{data.board.columns ? data.board.columns.length : 0} columns</span>
		</div>
	</div>

	{#if data.board.columns && data.board.columns.length > 0}
		<div class="columns-section">
			<h2>Board Structure</h2>
			<div class="columns-grid">
				{#each data.board.columns as column (column.id)}
					<div class="column-card">
						<div class="column-header">
							<h3>{column.title}</h3>
							<span class="column-type" style="background-color: {getFieldTypeColor(column.type)}">
								{column.type}
							</span>
						</div>
						
						<div class="column-details">
							<div class="detail-row">
								<strong>ID:</strong> <code>{column.id}</code>
							</div>
							<div class="detail-row">
								<strong>Type:</strong> {column.type}
							</div>
							{#if column.description}
								<div class="detail-row">
									<strong>Description:</strong> {column.description}
								</div>
							{/if}
						</div>

						{#if column.type === 'status' || column.type === 'dropdown'}
							{@const labels = parseSettingsLabels(column.settings_str)}
							{#if labels && labels.length > 0}
								<div class="column-options">
									<strong>Options ({labels.length}):</strong>
									<div class="options-list">
										{#each labels as label, index}
											<div class="option-item">
												<span class="option-index">{index}</span>
												<span class="option-value">{label}</span>
											</div>
										{/each}
									</div>
								</div>
							{:else if labels}
								<div class="column-options">
									<strong>Options:</strong>
									<small>No options defined.</small>
								</div>
							{:else}
								<div class="column-options">
									<strong>Options:</strong>
									<small>Could not parse options.</small>
								</div>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="summary-section">
			<h2>Summary</h2>
			<div class="summary-stats">
				<div class="stat-card">
					<h3>Total Columns</h3>
					<div class="stat-number">{data.board.columns.length}</div>
				</div>
				<div class="stat-card">
					<h3>Status/Dropdown Fields</h3>
					<div class="stat-number">{data.board.columns.filter(c => c.type === 'status' || c.type === 'dropdown').length}</div>
				</div>
				<div class="stat-card">
					<h3>Text Fields</h3>
					<div class="stat-number">{data.board.columns.filter(c => c.type === 'text' || c.type === 'long_text').length}</div>
				</div>
				<div class="stat-card">
					<h3>Date Fields</h3>
					<div class="stat-number">{data.board.columns.filter(c => c.type === 'date').length}</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="empty-state">
			<p>No columns found for this board.</p>
		</div>
	{/if}
</div>

<style>
	.container {
		font-family: sans-serif;
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
		background-color: #f8f9fa;
		min-height: 100vh;
		color: #333;
	}

	.header {
		margin-bottom: 2rem;
	}

	.back-link {
		color: #3498db;
		text-decoration: none;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		display: inline-block;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	h1 {
		color: #2c3e50;
		margin: 0 0 1rem 0;
		font-size: 2rem;
	}

	.board-meta {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		margin-bottom: 1rem;
	}

	.board-id code {
		background-color: #f8f9fa;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
	}

	.column-count {
		background-color: #ecf0f1;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		color: #7f8c8d;
	}

	.columns-section h2 {
		color: #34495e;
		border-bottom: 2px solid #3498db;
		padding-bottom: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.columns-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.column-card {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		border: 1px solid #e1e8ed;
	}

	.column-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.column-header h3 {
		margin: 0;
		color: #2c3e50;
		flex: 1;
		min-width: 0;
		font-size: 1.1rem;
	}

	.column-type {
		background-color: #3498db;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: bold;
		text-transform: uppercase;
	}

	.column-details {
		margin-bottom: 1rem;
	}

	.detail-row {
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.detail-row strong {
		color: #34495e;
		margin-right: 0.5rem;
	}

	.detail-row code {
		background-color: #f8f9fa;
		padding: 0.125rem 0.25rem;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
	}

	.column-options {
		border-top: 1px solid #ecf0f1;
		padding-top: 1rem;
	}

	.column-options strong {
		color: #34495e;
		margin-bottom: 0.5rem;
		display: block;
	}

	.options-list {
		max-height: 150px;
		overflow-y: auto;
		border: 1px solid #e1e8ed;
		border-radius: 4px;
		padding: 0.5rem;
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0;
		font-size: 0.85rem;
	}

	.option-index {
		background-color: #95a5a6;
		color: white;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 0.75rem;
		flex-shrink: 0;
	}

	.option-value {
		flex: 1;
		font-weight: 500;
	}

	.summary-section {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 2px solid #3498db;
	}

	.summary-section h2 {
		color: #34495e;
		margin-bottom: 1.5rem;
	}

	.summary-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		border: 1px solid #e1e8ed;
	}

	.stat-card h3 {
		margin: 0 0 0.5rem 0;
		color: #7f8c8d;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: bold;
		color: #3498db;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	small {
		color: #777;
		font-style: italic;
	}
</style>