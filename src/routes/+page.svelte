<script>
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import Detail from '$lib/components/form/detail.svelte';
	import Question from '$lib/components/form/question.svelte';
	import details from '$lib/details.svelte';
	import survey from '$lib/survey.svelte';
	import surveyApi from '$lib/api/survey';
	import Upload from '$lib/components/form/upload.svelte';
	import ThreeScene from '$lib/three';

	let threeScene = new ThreeScene();

	function submitInfo() {
		const surveyResponses = survey.remapResponses();
		const detailResponses = details.remapDetails();
		surveyApi.create({ responses: { ...surveyResponses, ...detailResponses } });
	}
</script>

<div class="mx-auto mb-10 max-w-[550px] p-3 px-10">
	<RecordDesigner {threeScene} width="375px" height="375px" />

	<Upload {threeScene} />
	<div class="m-auto block p-0">
		{#each Object.entries(survey.state.questions) as [key, question]}
			<Question {key} label={question.label} options={question.options} />
		{/each}
	</div>

	<div class="mt-4 flex flex-col gap-4">
		<Detail label={'Your Name'} key={'your_name'} />
		<Detail />
	</div>
	<button onclick={submitInfo} class="mt-4">Submit</button>
</div>
