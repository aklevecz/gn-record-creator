<script>
	import { CURRENT_TEXTURE } from '$lib';
	import details from '$lib/details.svelte';
	import idb from '$lib/idb';
	import project from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import survey from '$lib/survey.svelte';
	import threeScenes from '$lib/three.svelte';

	// let { threeScene } = $props();

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
		idb.getTexture(`${projects.activeProject?.id}-${CURRENT_TEXTURE}`).then((textureFile) => {
			if (!textureFile) {
				console.log('THERE IS NO CURRENT TEXTURE');
				return;
			}
			const url = URL.createObjectURL(textureFile.imgFile);
			if (threeScenes.form) threeScenes.form.updateMaterialTexture(url);
		});
	}
</script>

<div class="relative mb-0 inline-block w-full py-2">
	<select
		class="focus:shadow-outline block w-full appearance-none rounded border border-gray-300 bg-[var(--primary-color)] px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none"
		bind:value={projects.state.activeProject}
		onchange={onChangeProject}
	>
		<option value="" disabled>Select a project</option>
		{#each projects.state.projects as project}
			<option value={project.name}>{project.name}</option>
		{/each}
	</select>
	<div
		class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--secondary-color)]"
	>
		<svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
		</svg>
	</div>
</div>

<!-- <div>
	<input bind:value={projectName} class="border-1 border-white" />
	<button class="text-xs" onclick={createProject}>Create Project</button>
</div> -->

<style lang="postcss">
	@reference "tailwindcss/theme";
	select {
		@apply text-base;
	}
</style>
