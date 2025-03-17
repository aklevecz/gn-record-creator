<script>
	import generate from '$lib/generate.svelte';
	import idb from '$lib/idb';
	import { fade } from 'svelte/transition';
	import Upload from '../form/upload.svelte';
	import { cachedKeys } from '$lib/storage';
	import projects from '$lib/projects.svelte';

	let { isMinimized = $bindable(), threeScene } = $props();

	let prompt = $state('');

	/**
	 * @typedef ButtonView @type { 'ai' | 'upload' | 'history' }
	 */

	/** @type {ButtonView} buttonView*/
	let buttonView = $state('ai');

	/** @type {Record<Status, string>}*/
	const generatingMessages = {
		idle: 'Waiting...',
		starting: 'Booting up...',
		processing: 'Dreaming up...',
		succeeded: 'Done!',
		canceled: 'Canceled',
		failed: 'Failed'
	};

	/** @param {{url: string, blob: Blob, id: string}} props */
	function showImgOnCover({ url, blob, id }) {
		threeScene.updateMaterialTexture(url);
		idb.saveTexture({
			imgFile: blob,
			seed: 'user-upload',
			id: 'last-texture',
			projectId: 'active'
		});
		if (projects.activeProject) {
			cachedKeys.setProjectTexture(projects.activeProject.id, id);
		}
	}

	/** @param {ButtonView} view */
	function toggleView(view) {
		isMinimized = false;
		buttonView = view;
	}

	// NOT NECESSARY
	function resizeButtonContainer() {
		// if (window.innerWidth < 1024) {
		// 	isMobile = true;
		// 	const rect = document.querySelector('.buttons-container')?.getBoundingClientRect();
		// 	if (rect) {
		// 		buttonContainerHeight = `${rect.height}px`;
		// 		buttonContainerHeight = `${360}px`
		// 		buttonContainerHeight = 'auto'
		// 	}
		// } else {
		// 	isMobile = false;
		// 	buttonContainerHeight = 'auto';
		// }
	}

	let isMobile = $state(true);
	let buttonContainerHeight = $state('auto');
	// onMount(() => {
	// 	if (browser) {
	// 		resizeButtonContainer();
	// 		window.addEventListener('resize', resizeButtonContainer);
	// 	}
	// });

	// onDestroy(() => {
	// 	if (browser) {
	// 		window.removeEventListener('resize', resizeButtonContainer);
	// 	}
	// });

	async function onGenerate() {
		threeScene.toggleShader();

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
</script>

<div
	style={isMinimized ? 'height: 40px;' : `height: ${buttonContainerHeight} `}
	class:minimized={isMinimized}
	class="buttons-container"
>
	<div class="view-button-container">
		<button class="view-button" class:active={buttonView === 'ai'} onclick={() => toggleView('ai')}
			>Dream</button
		>
		<button
			class="view-button"
			class:active={buttonView === 'upload'}
			onclick={() => toggleView('upload')}>Upload</button
		>
		<button
			class="view-button"
			class:active={buttonView === 'history'}
			onclick={() => toggleView('history')}>History</button
		>
		<div class="flex-1"></div>
		<button onclick={() => (isMinimized = !isMinimized)} class="view-button"
			>{isMinimized ? 'Maximize' : 'Minimize'}</button
		>
	</div>
	{#if !isMinimized}
		{#if buttonView === 'upload'}
			<div class="px-12 py-4">Press the button or drag an image onto it to upload</div>
			<Upload {threeScene} />
		{/if}
		{#if buttonView === 'ai'}
			<div class="view">
				{#if generate.state.status !== 'idle'}<div transition:fade class="percent-bar-container">
						<div class="percent-bar" style="width:{generate.state.percentage}%"></div>
						<div class="generate-status">
							{generatingMessages[generate.state.status] || generate.state.status}
						</div>
					</div>{/if}
				<!-- {#if !isMobile} -->
				<div class="px-10">Submit a dream and see it appear on the album cover.</div>
				<img
					class:generating={generate.state.generating}
					src="/characters/infatuation-color.svg"
					class="h-20 invert md:h-auto"
					alt="Infatuation"
				/>
				<!-- {/if} -->
				<textarea
					class="mt-2 border-1 border-white"
					onkeydown={(e) => e.key === 'Enter' && onGenerate()}
					name="prompt"
					bind:value={prompt}
				></textarea>

				<button
					disabled={generate.state.generating}
					class:generating={generate.state.generating}
					onclick={onGenerate}
					>{generate.state.generating
						? generatingMessages[generate.state.status]
						: 'GENERATE'}</button
				>
			</div>
		{/if}
		{#if buttonView === 'history'}
			<div class="px-10">This is where you store your dreams</div>
			{#if generate.state.cachedImgs.length === 0}
				<div>No dreams yet. What are you waiting for?</div>
				<img src="/characters/hifive-color.svg" class="h-20 invert md:h-auto" alt="Infatuation" />
				<button class="mt-4" onclick={() => toggleView('ai')}>Create a dream</button>
			{/if}
			<div class="history-container overflow-scroll">
				{#each generate.state.cachedImgs as cachedImg}
					{@const url = URL.createObjectURL(cachedImg.imgBlob)}
					<button
						class="history-img-button"
						onclick={() => showImgOnCover({ url, blob: cachedImg.imgBlob, id: cachedImg.id })}
					>
						<img src={url} alt="" class="history-img" /></button
					>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.buttons-container {
		transition: height 0.3s ease-in-out;
		max-width: 600px;
		@apply fixed bottom-0 left-0 z-1 flex w-full flex-col items-center justify-center bg-[var(--primary-color)] py-3 md:static md:bottom-10;
	}

	.buttons-container.minimized {
		@apply md:w-[80px] md:rotate-[90deg];
	}

	/* .buttons-container.minimized {
		@apply h-[50px];
	} */

	.view-button-container {
		@apply mb-4 flex w-[80%] gap-2;
	}

	button.view-button {
		@apply rounded-none p-1 px-2 text-xs md:text-base;
	}

	button.view-button.active {
		@apply bg-[var(--primary-color)] text-[var(--secondary-color)];
	}

	.view {
		@apply flex w-full max-w-xl flex-col items-center justify-center gap-4;
	}

	.generate-status {
		@apply mt-1 bg-[var(--primary-color)] text-center text-sm font-bold;
	}

	button.generating {
		opacity: 0.5;
	}

	textarea {
		@apply h-20 w-5/6 px-2 py-1 md:h-[150px];
	}

	.percent-bar-container {
		@apply fixed top-15 m-2 h-4 w-3/4 border-[var(--secondary-color)] bg-white md:left-0 md:w-1/2;
	}

	.percent-bar {
		transition: width 500ms ease-in-out;
		@apply h-full bg-[var(--accent-color)];
	}

	.history-container {
		@apply grid grid-cols-3 gap-2 p-2;
	}

	.history-img-button {
		background-color: none;
		background: none;
		@apply p-1;
	}

	.history-img {
		@apply w-full;
	}

	.generating {
		animation: glow 1s ease-in-out infinite alternate;
	}

	@keyframes glow {
		from {
			filter: blur(0px) invert(1) hue-rotate(0deg);
		}
		to {
			filter: blur(0.5px) invert(0.5) hue-rotate(45deg);
		}
	}
</style>
