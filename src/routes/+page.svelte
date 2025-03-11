<script>
	import { CURRENT_TEXTURE } from '$lib';
	import surveyApi from '$lib/api/survey';
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import Detail from '$lib/components/form/detail.svelte';
	import Question from '$lib/components/form/question.svelte';
	import Upload from '$lib/components/form/upload.svelte';
	import details from '$lib/details.svelte';
	import idb from '$lib/idb';
	import project from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import survey from '$lib/survey.svelte';
	import ThreeScene from '$lib/three';
	import { onMount } from 'svelte';

	let threeScene = new ThreeScene();

	function submitInfo() {
		const surveyResponses = survey.remapResponses();
		const detailResponses = details.remapDetails();
		surveyApi.create({ responses: { ...surveyResponses, ...detailResponses } });
	}

	let projectName = $state('');
	function createProject() {
		const newProject = project.create({
			name: projectName,
			details: { ...details.state },
			survey: { ...survey.state }
		});
		projects.registerProject(newProject);
		idb.addProject(newProject);
	}

	/** @param {*} e */
	function onChangeProject(e) {
		const projectName = e.target.value;
		projects.activateProject(projectName);
		idb.getTexture(`${projectName}-${CURRENT_TEXTURE}`).then((textureFile) => {
			if (!textureFile) {
				console.log('THERE IS NO CURRENT TEXTURE');
				return;
			}
			const url = URL.createObjectURL(textureFile.imgFile);
			threeScene.updateMaterialTexture(url);
		});
	}

	onMount(() => {
		idb.init().then(() => {
			projects.init();
		});
	});
</script>

<div class="mx-auto mb-10 max-w-[570px] rounded-md p-3 px-12">
	<h1 class="text-2xl font-bold">Good Neighbor Record Setup Form</h1>
	<div class="text-xs">
		Please fill out the following information so we can set up your project in our system, verify
		production schedule and get you quotes.
	</div>
	<!-- <div class="relative mb-4 inline-block w-full">
		<select
			class="focus:shadow-outline block w-full appearance-none rounded border border-gray-300 bg-black px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none"
			bind:value={projects.state.activeProject}
			onchange={onChangeProject}
		>
			<option value="" disabled>Select a project</option>
			{#each projects.state.projects as project}
				<option value={project.name}>{project.name}</option>
			{/each}
		</select>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
		>
			<svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
				<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
			</svg>
		</div>
	</div>
	<div>
		<input bind:value={projectName} class="border-1 border-white" />
		<button class="text-xs" onclick={createProject}>Create Project</button>
	</div> -->
	<div class="mt-4 flex flex-col gap-4">
		{#each Object.entries(details.state.details) as [key, detail]}
			{@const type = detail.type}
			{#if type === 'select'}
				{@const question = survey.state.questions[key]}
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
