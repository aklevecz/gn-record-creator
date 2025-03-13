<script>
	import { CURRENT_TEXTURE } from '$lib';
	import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
	import ConfirmationModal from '$lib/components/project/confirmation-modal.svelte';
	import details from '$lib/details.svelte';
	import generate from '$lib/generate.svelte';
	import idb from '$lib/idb';
	import project, { createProject } from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import survey from '$lib/survey.svelte';
	import threeScenes from '$lib/three.svelte';
	import { onMount } from 'svelte';

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
		const newProjectStore = createProject();
		const newProject = newProjectStore.create({
			details: { ...details.state },
			survey: { ...survey.state }
		});
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

	let lastTexture = $state(null);

	/** @type {{file: File, type: string}[]} */
	let uploadedImgUrls = $state([]);
	// /** @type {string[]} */
	// let generatedImgUrls = $state([]);
	/** @type {{url:string, id: string, seed:string, fileName: string}[]} */
	let urls = $state([]);
	$effect(() => {
		if (project.state.id) {
			idb.getTexturesByProjectId(project.state.id).then((cachedTextures) => {
				urls = cachedTextures.map((texture) => {
					console.log(`Loading file ${texture.imgFile.name}`);
					const blobFromBuffer = new Blob([texture.arrayBuffer], { type: texture.imgFile.type });
					const url = URL.createObjectURL(blobFromBuffer);
					return { url, id: texture.id, seed: texture.seed, fileName: texture.fileName };
				});
			});

			// projects.cachedTextures = cachedTextures.sort(
			// 	(/** @type {GeneratedImgEntry} */ a, /** @type {GeneratedImgEntry} */ b) =>
			// 		a.lastModified - b.lastModified
			// );

			// idb.getGeneratedImgsByProjectId(project.state.id).then((imgs) => {
			// 	for (const img of imgs) {
			// 		generatedImgUrls = [...generatedImgUrls, URL.createObjectURL(img.imgBlob)];
			// 	}
			// });
			// idb.getTexture('last-texture').then((texture) => {
			// 	lastTexture = texture;
			// });
			// generate.refreshAllGeneratedImgs().then(() => {
			// 	idb.getTexturesByProjectId(project.state.id).then((imgs) => {
			// 		uploadedImgUrls = [];
			// 		for (const img of imgs) {
			// 			console.log(`Processing texture:, ${img.id}, 'type:', ${typeof img.imgFile},
			//      'instanceof Blob:', ${img.imgFile instanceof Blob},
			//      'instanceof File:', ${img.imgFile instanceof File}`);
			// 			uploadedImgUrls = [
			// 				...uploadedImgUrls,
			//                 img.imgFile
			// 				// {
			// 				// 	file: img.imgFile,
			// 				// 	type: img.seed === 'user-upload' ? 'upload' : 'ai'
			// 				// }
			// 			];
			// 		}
			// 	});
			// .catch(alert);
			// });
		}
	});

	let deleteProjectModalOpen = $state(false);
	function confirmDeleteProject() {
		deleteProjectModalOpen = true;
	}

	function executeDeleteProject() {
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

	let deleteImageModalOpen = $state(false);
	let imageToDeleteId = $state('');
	/** @param {string} id*/
	function confirmDeleteImg(id) {
		imageToDeleteId = id;
		deleteImageModalOpen = true;
	}

	function executeDeleteImg() {
		if (!imageToDeleteId) return;

		idb.deleteTexture(imageToDeleteId);
		urls = urls.filter((url) => url.id !== imageToDeleteId);
		imageToDeleteId = '';
	}
</script>

<ConfirmationModal
	isOpen={deleteProjectModalOpen}
	title="Delete Project"
	message="Are you sure you want to delete this project? This action cannot be undone."
	confirmButtonText="Delete"
	cancelButtonText="Cancel"
	onConfirm={executeDeleteProject}
	onCancel={() => (deleteProjectModalOpen = false)}
/>
<ConfirmationModal
	isOpen={deleteImageModalOpen}
	title="Delete Image"
	message="Are you sure you want to delete this image? This action cannot be undone."
	confirmButtonText="Delete"
	cancelButtonText="Cancel"
	onConfirm={executeDeleteImg}
	onCancel={() => (deleteImageModalOpen = false)}
/>
<div class="mx-auto mb-10 max-w-[570px] rounded-md p-3 px-6">
	<h1>Project Editor</h1>
	<ChangeProjectDropdown />
	<h1>Gallery</h1>
	<div class="imgs">
		{#each urls as { url, id, seed, fileName }}
			<div style="{seed === 'user-upload' ? 'border: var(--purple)' : 'border: var(--green)'} solid 2px" class="history-img-container">
				<img src={url} alt="" class="history-img" />
                <div class="history-file-name">{fileName}</div>
				<button class="delete-button" onclick={() => confirmDeleteImg(id)}>Delete</button>
			</div>
		{/each}
	</div>

	<!-- <h1>Gens</h1>
	{#if generate.state.cachedImgs.length === 0}
		<div>No gens yet</div>
	{/if}
	<div class="imgs">
		{#each generate.state.cachedImgs as gen}
			{@const url = URL.createObjectURL(gen.imgBlob)}
			<div>
				<img src={url} alt="" class="history-img" />
				<button class="delete-button">Delete</button>
			</div>
		{/each}
	</div> -->
	<div class="mb-4 flex w-full flex-col gap-1 text-xs">
		<div>Current Project: {project.state.name}</div>
		<button class="project-edit-buttons" onclick={createNewProject}>Create New Project</button>
		<button class="project-edit-buttons" onclick={confirmDeleteProject}>Delete Project</button>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.project-edit-buttons {
		padding: 2px 8px;
		width: 150px;
		@apply text-xs;
	}
	h1 {
		@apply mb-1 text-xl font-bold;
	}
	.imgs {
		@apply mb-4 flex flex-wrap gap-2;
	}
	.history-img-container {
		@apply flex-[0_0_47%] p-2 rounded-md;
	}
    .history-file-name {
        word-break: break-word;
        @apply text-xs;
    }
	.imgs img {
	}
	.delete-button {
		@apply mt-2 px-2 py-1 text-xs text-red-500;
	}
</style>
