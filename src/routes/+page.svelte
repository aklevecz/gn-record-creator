<script>
	import { browser } from '$app/environment';
	import Detail from '$lib/components/form/detail.svelte';
	import Question from '$lib/components/form/question.svelte';
	import Upload from '$lib/components/form/upload.svelte';
	import idb from '$lib/idb';
	import survey from '$lib/survey.svelte';
	import ThreeScene from '$lib/three';
	import { onMount } from 'svelte';

	/** @type {ThreeScene | null}*/
	let threeModel = $state(null);
	/** @type {null | HTMLElement}*/
	let container = $state(null);
	onMount(async () => {
		if (container && browser) {
			idb.init().then(() => {
				threeModel = new ThreeScene(container);
				threeModel.init(container);
				threeModel.animate();
			});

			// const models = await modelStorage.getRecentModels();

			// if (!models.length) {
			// 	console.error('No models found');
			// 	return;
			// }

			// const modelEntry = await modelStorage.getModel(models[0].id);

			// if (!modelEntry) {
			// 	console.error(`Model not found: ${models[0].id}`);
			// 	return;
			// }
			// selectedModel = modelEntry.id;

			// const blob = new Blob([modelEntry.data]);
			// const blobUrl = URL.createObjectURL(blob);

			// threeModel.loadModel(blobUrl);
		}
	});
</script>

<div class="mx-auto max-w-[750px] p-3">
	<div bind:this={container} class="three-container"></div>
	<Upload {threeModel} />
	<div class="m-auto block p-0">
		{#each Object.entries(survey.state.questions) as [key, question]}
			<Question {key} label={question.label} options={question.options} />
		{/each}
	</div>
	<div class="flex flex-col gap-4 mt-4">
		<Detail />
		<Detail />
	</div>
</div>

<style>
	.three-container {
		width: 345px;
		height: 345px;
		aspect-ratio: square;
		/* border: 2px solid white; */
		margin: 0 auto;
	}
</style>
