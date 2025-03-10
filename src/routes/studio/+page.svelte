<script>
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import Upload from '$lib/components/form/upload.svelte';
	import generate from '$lib/generate.svelte';
	import ThreeScene from '$lib/three';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let prompt = $state('');

	let threeScene = new ThreeScene();

	/**
	 * @typedef ButtonView @type { 'ai' | 'upload' }
	 */

	/** @type {ButtonView} buttonView*/
	let buttonView = $state('ai');

	/** @param {ButtonView} view */
	function toggleView(view) {
		isMinimized = false;
		buttonView = view;
	}

	let isMinimized = $state(false);

	async function onGenerate() {
		const model = 'black-forest-labs/flux-schnell';
		try {
			let data = await generate.createGeneration(prompt, model);
			if (!data?.id) {
				throw new Error('id is missing');
			}
			console.log(`Polling generation: ${data.id}`);
			generate.pollGeneration(data.id, (/** @type {string} */ url) =>
				threeScene.updateMaterialTexture(url)
			);
		} catch (/** @type {*} */ e) {
			alert(e.message);
		}
	}

	/** @type {Record<Status, string>}*/
	const generatingMessages = {
		idle: 'Waiting...',
		starting: 'Booting up...',
		processing: 'Dreaming up...',
		succeeded: 'Done!',
		canceled: 'Canceled',
		failed: 'Failed'
	};
</script>

<div class="h-[80vh]">
	<RecordDesigner {threeScene} />

	<div class:minimized={isMinimized} class="buttons-container">
		<div class="view-button-container">
			<button
				class="view-button"
				class:active={buttonView === 'ai'}
				onclick={() => toggleView('ai')}>AI</button
			>
			<button
				class="view-button"
				class:active={buttonView === 'upload'}
				onclick={() => toggleView('upload')}>Upload</button
			>
			<div class="flex-1"></div>
			<button onclick={() => (isMinimized = !isMinimized)} class="view-button">{isMinimized ? 'Maximize' : 'Minimize'}</button>
		</div>
		{#if !isMinimized}
			{#if buttonView === 'upload'}
				<div class="p-12 pb-4">Press the button or drag an image onto it to upload</div>
				<Upload {threeScene} />
			{/if}
			{#if buttonView === 'ai'}
				<div class="view">
					<div class="generate-status">
						{generatingMessages[generate.state.status] || generate.state.status}
					</div>
					<div class="percent-bar-container">
						<div class="percent-bar" style="width:{generate.state.percentage}%"></div>
					</div>
					<textarea
						class="border-1 border-white"
						onkeydown={(e) => e.key === 'Enter' && onGenerate()}
						name="prompt"
						bind:value={prompt}
					></textarea>

					<button
						disabled={generate.state.generating}
						class:generating={generate.state.generating}
						onclick={onGenerate}>{generate.state.generating ? 'GENERATING...' : 'GENERATE'}</button
					>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.buttons-container {
		transition: height 0.3s ease-in-out;
		@apply absolute bottom-4 left-0 z-1 flex h-[350px] w-full flex-col items-center bg-[var(--primary-color)] py-3;
	}

	.buttons-container.minimized {
		@apply h-[90px];
	}

	.view-button-container {
		@apply mb-4 flex gap-2 w-[80%];
	}

	button.view-button {
		@apply rounded-none p-1 px-2 text-xs;
	}

	button.view-button.active {
		@apply bg-[var(--primary-color)] text-[var(--secondary-color)];
	}

	.view {
		@apply flex w-full max-w-xl flex-col items-center justify-center gap-4;
	}

	.generate-status {
		@apply text-sm font-bold;
	}

	button.generating {
		opacity: 0.5;
	}

	textarea {
		@apply h-20 w-5/6 px-2 py-1;
	}

	.percent-bar-container {
		@apply m-2 h-4 w-3/4 bg-white border-[var(--secondary-color)];
	}

	.percent-bar {
		@apply h-full bg-[var(--accent-color)];
	}
</style>
