<script>
	import Detail from '$lib/components/form/detail.svelte';
	import Question from '$lib/components/form/question.svelte';
	import details from '$lib/details.svelte';
	import project from '$lib/project.svelte';
	import { questions } from '$lib/survey.svelte';

	import { goto } from '$app/navigation';
	import surveyApi from '$lib/api/survey';
	import mondayClientApi from '$lib/api/monday';
	import ThreeHomepage from '$lib/components/three/three-homepage.svelte';
	import { debounce, hashFunction } from '$lib/utils';
	import projects from '$lib/projects.svelte';


	let submitting = $state(false)
	async function submitInfo() {
		submitting = true;
		// const surveyResponses = survey.remapResponses();
		const detailResponses = details.remapDetails();
		// console.log(project.state.id);
		// console.log(project.state)
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await surveyApi.create({ id: project.state.id, responses: { ...detailResponses } });
		await mondayClientApi.create({
			id: project.state.id,
			responses: { ...detailResponses, status: 'Submitted' }
		});
		submitting = false;
		goto(`/submission/${project.state.id}`);
	}
	const FIVE_SECONDS  = 5 * 1000;
	const ONE_MINUTE_MS = 60 * 1000;
	const THIRTY_SECONDS_MS = 30 * 1000;
	const debouncedCreate = debounce((/** @type {*} */ data) => {
		mondayClientApi.create(data);
	}, FIVE_SECONDS);

	let detailsHash = $state('');
	// THIS GETS TRIGGERED A LOT AT INITIATION
	$effect(() => {
		if (!projects.state.initialized) return;
		console.log(project.state);
		const detailResponses = details.remapDetails();
		const hash = hashFunction(detailResponses);

		// IGNORE FIRST UPDATE
		if (detailsHash === '') {
			detailsHash = hash;
			return;
		}
		console.log('RENGAR');
		if (hash !== detailsHash) {
			detailsHash = hash;
			// mondayClientApi.create({ id: project.state.id, responses: { ...detailResponses } });
			debouncedCreate({ id: project.state.id, responses: { ...detailResponses } });
		}
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
	{#if projects.state.initialized}<ThreeHomepage />{/if}
	<div class="my-10">
		<div class="text- mb-2 p-4">
			Press submit if you have finished filling out all of the required info. You will be able to
			edit things later.
		</div>
		<button onclick={submitInfo} class="mx-auto block text-2xl">
			{#if submitting}
		<img class="mx-auto" class:isSubmitting={submitting} src="/characters/juggle-color.svg" alt="juggle graphic">
			Submitting
			{:else}
				Submit
			{/if}
		</button>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.design-creator-container {
		@apply fixed md:fixed md:top-0;
	}
	img.isSubmitting {
		animation: hue-rotate 1s infinite;
	}
	@keyframes hue-rotate {
		from {
			filter: hue-rotate(0deg);
		}
		to {
			filter: hue-rotate(360deg);
		}
	}
</style>
