<script>
	import { browser } from '$app/environment';
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import Detail from '$lib/components/form/detail.svelte';
	import Question from '$lib/components/form/question.svelte';
	import Upload from '$lib/components/form/upload.svelte';
	import details from '$lib/details.svelte';
	import project from '$lib/project.svelte';
	import { questions } from '$lib/survey.svelte';
	import threeScenes from '$lib/three.svelte';
	import ThreeScene from '$lib/ThreeScene';
	import { onDestroy, onMount } from 'svelte';

	import mondayClientApi from '$lib/api/monday';
	import ThreeHomepage from '$lib/components/three/three-homepage.svelte';

	let threeScene = new ThreeScene();
	threeScenes['form'] = threeScene;

	function submitInfo() {
		// const surveyResponses = survey.remapResponses();
		const detailResponses = details.remapDetails();
		// console.log(project.state.id);
		// console.log(project.state)
		// surveyApi.create({ id: project.state.id, responses: { ...detailResponses } });
		mondayClientApi.create({ id: project.state.id, responses: { ...detailResponses } });
		// goto(`/submission/${project.state.id}`);
	}

	// onMount(() => {
	// 	idb.init().then(() => {
	// 		projects.init();
	// 	});
	// });

	function resizeThree() {
		threeScene.resize();
	}
	onMount(() => {
		if (browser) window.addEventListener('resize', resizeThree);
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('resize', resizeThree);
	});

	$effect(() => {
		// console.log(project.state)
	});
</script>

<div class="mx-auto mb-10 max-w-[570px] rounded-md p-0 px-6 md:mx-0">
	<h1 class="text-2xl font-bold">Record Setup Form</h1>
	<div class="text-xs">
		Please fill out the following information so we can set up your project in our system, verify
		production schedule and get you quotes.
	</div>

	<div class="mt-4 flex flex-col gap-4">
		{#each Object.entries(details.state.details) as [key, detail]}
			{@const type = detail.type}
			{#if type === 'select'}
				{@const question = questions[key]}
				{#if question}
					<Question {key} label={question.label} options={question.options} />
				{/if}
			{:else}
				<Detail label={detail.label} {key} description={detail.description} />
			{/if}
		{/each}
	</div>
	<ThreeHomepage />
	<div class="my-10">
		<div class="text- mb-2 p-4">
			Press submit if you have finished filling out all of the required info. You will be able to
			edit things later.
		</div>
		<button onclick={submitInfo} class="mx-auto block text-2xl">Submit</button>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.design-creator-container {
		@apply fixed md:fixed md:top-0;
	}
</style>
