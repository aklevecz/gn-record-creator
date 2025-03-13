<script>
	import { CURRENT_TEXTURE } from '$lib';
	import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
	import details from '$lib/details.svelte';
	import idb from '$lib/idb';
	import project, { createProject } from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import survey from '$lib/survey.svelte';
	import threeScenes from '$lib/three.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

    // janky because it has to reset the current details applied to the current project
	function createNewProject() {
		details.reset();
		// const newProject = project.create({
		// 	details: { ...details.state },
		// 	// SURVEY IS DEPRECATED
		// 	survey: { ...survey.state }
		// });
        const newProjectStore = createProject()
        const newProject = newProjectStore.create({
            details: { ...details.state },
            survey: { ...survey.state }
        })
		projects.registerProject(newProject);
		idb.addProject(newProject);
		projects.activateProject(newProject.name);
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

	/** @type {{url: string, type: string}[]} */
	let uploadedImgUrls = $state([]);
	// /** @type {string[]} */
	// let generatedImgUrls = $state([]);
	$effect(() => {
        console.log(projects.state.projects)
		if (project.state.id) {
			// idb.getGeneratedImgsByProjectId(project.state.id).then((imgs) => {
			// 	for (const img of imgs) {
			// 		generatedImgUrls = [...generatedImgUrls, URL.createObjectURL(img.imgBlob)];
			// 	}
			// });

			idb.getTexturesByProjectId(project.state.id).then((imgs) => {
                uploadedImgUrls = [];
				for (const img of imgs) {
					uploadedImgUrls = [
						...uploadedImgUrls,
						{
							url: URL.createObjectURL(img.imgFile),
							type: img.seed === 'user-upload' ? 'upload' : 'ai'
						}
					];
				}
			});
		}
	});
</script>
<div class="mx-auto mb-10 max-w-[570px] rounded-md p-3 px-6">
	<h1>Project Editor</h1>
	<ChangeProjectDropdown />
	<!-- <div>
        <h1>Generated</h1>
		{#each generatedImgUrls as url}
			<img src={url} alt="" />
		{/each}
	</div> -->
	<div class="imgs">
		{#each uploadedImgUrls as img}
			<img src={img.url} style="border:4px solid {img.type === 'upload' ? 'var(--purple)' : 'var(--green)'};" alt="" />
		{/each}
	</div>
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

	.imgs {
		@apply mb-4 flex flex-wrap gap-2;
	}
	.imgs img {
		@apply flex-[0_0_30%] w-[45%];
	}
</style>
