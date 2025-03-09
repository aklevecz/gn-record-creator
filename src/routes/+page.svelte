<script>
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import Detail from '$lib/components/form/detail.svelte';
	import Question from '$lib/components/form/question.svelte';
	import survey from '$lib/survey.svelte';
</script>

<div class="mx-auto max-w-[750px] p-3">
	<RecordDesigner />

	<div class="m-auto block p-0">
		{#each Object.entries(survey.state.questions) as [key, question]}
			<Question {key} label={question.label} options={question.options} />
		{/each}
	</div>

	<div class="mt-4 flex flex-col gap-4">
		<Detail label={'Your Name'} key={'your_name'}/>
		<Detail />
	</div>
</div>
