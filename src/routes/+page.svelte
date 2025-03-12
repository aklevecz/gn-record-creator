<script>
	import { goto } from '$app/navigation';
	import surveyApi from '$lib/api/survey';
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import Detail from '$lib/components/form/detail.svelte';
	import Question from '$lib/components/form/question.svelte';
	import Upload from '$lib/components/form/upload.svelte';
	import details from '$lib/details.svelte';
	import idb from '$lib/idb';
	import project from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import { questions } from '$lib/survey.svelte';
	import ThreeScene from '$lib/three';
	import { onMount } from 'svelte';

	let threeScene = new ThreeScene();

	function submitInfo() {
		// const surveyResponses = survey.remapResponses();
		const detailResponses = details.remapDetails();
		// console.log(project.state.id);
		// console.log(project.state)
		surveyApi.create({ id: project.state.id, responses: { ...detailResponses } });
		goto(`/submission/${project.state.id}`);
	}

	onMount(() => {
		idb.init().then(() => {
			projects.init();
		});
	});
</script>

<div class="mx-auto mb-10 max-w-[570px] rounded-md p-3 px-6">
	<h1 class="text-2xl font-bold">Good Neighbor Record Setup Form</h1>
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

	<h2 class="mt-12 text-center text-2xl font-bold">DESIGN CREATOR</h2>
	<RecordDesigner {threeScene} width="300px" height="300px" />

	<Upload {threeScene} />
	<!-- <div class="m-auto block p-0">
		{#each Object.entries(survey.state.questions) as [key, question]}
			<Question {key} label={question.label} options={question.options} />
		{/each}
	</div> -->
	<div class="mt-20">
		<div class="text-center mb-2">All done?</div>
		<button onclick={submitInfo} class="mx-auto block text-2xl">Submit</button>
	</div>
</div>
