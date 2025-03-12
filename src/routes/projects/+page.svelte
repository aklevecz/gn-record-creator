<script>
	import { CURRENT_TEXTURE } from '$lib';
	import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
	import details from '$lib/details.svelte';
	import idb from '$lib/idb';
	import project from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import survey from '$lib/survey.svelte';
	import threeScenes from '$lib/three.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	function createNewProject() {
		details.reset();
		const newProject = project.create({
			details: { ...details.state },
			// SURVEY IS DEPRECATED
			survey: { ...survey.state }
		});
		projects.registerProject(newProject);
		idb.addProject(newProject);
	}

	function deleteProject() {
		projects.removeProject(project.state.id);
		idb.deleteProject(project.state.id);
		const firstProject = projects.state.projects[0];
		projects.activateProject(firstProject.name);
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

<div class="mx-auto mb-10 max-w-[570px] rounded-md p-3 px-6">
	<h1>Project Editor</h1>
    <ChangeProjectDropdown/>
	<div class="mb-4 flex w-full flex-col gap-1 text-xs">
		<div>Current Project: {project.state.name}</div>
		<button class="project-edit-buttons" onclick={createNewProject}>Create New Project</button>
		<button class="project-edit-buttons" onclick={deleteProject}>Delete Project</button>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.project-edit-buttons {
		padding: 2px 8px;
		width: 150px;
		@apply text-xs;
	}
</style>
