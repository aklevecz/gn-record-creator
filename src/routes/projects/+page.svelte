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

	let lastTexture = $state('/records/cosmic-black.png');

	/** @type {{file: File, type: string}[]} */
	let uploadedImgUrls = $state([]);
	// /** @type {string[]} */
	// let generatedImgUrls = $state([]);
	/** @type {{url:string, id: string, seed:string, fileName: string, blob: Blob}[]} */
	let urls = $state([]);
	$effect(() => {
		if (project.state.id) {
			idb.getTexturesByProjectId(project.state.id).then((cachedTextures) => {
				urls = cachedTextures.map((texture) => {
					console.log(`Loading file ${texture.imgFile.name}`);
					const blobFromBuffer = new Blob([texture.arrayBuffer], { type: texture.imgFile.type });
					const url = URL.createObjectURL(blobFromBuffer);
					console.log(texture);
					return {
						url,
						id: texture.id,
						seed: texture.seed,
						fileName: texture.fileName,
						blob: texture.imgFile
					};
				});

				idb.getTexture('last-texture').then((activeTexture) => {
					if (activeTexture) {
						const url = URL.createObjectURL(activeTexture.imgFile);
						lastTexture = url;
					}
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

	/** @param {Blob} blob */
	function activateTexture(blob) {
		idb.saveTexture({
			imgFile: blob,
			seed: 'user-upload',
			id: 'last-texture',
			projectId: 'active'
		});
		const url = URL.createObjectURL(blob);
		lastTexture = url;
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

<div class="mx-auto mb-10 rounded-md p-3 px-6">
	<h1>Project Editor</h1>
	<div class="flex max-w-lg items-center gap-4 md:w-3/4">
		<ChangeProjectDropdown />

		<button class="text-xs md:w-[300px] md:text-base" onclick={createNewProject}
			>Create Project</button
		>
	</div>

	<div class="flex min-h-[80vh] flex-col gap-4 md:flex-row md:pt-4">
		<div
			class="project-container text- mb-4 flex w-full flex-col gap-1 border-white md:min-w-[200px] md:flex-[0_1_20%] md:border-r-1 md:pt-4"
		>
			<h1>Project Info</h1>
			<div class="text-xl">{project.state.name}</div>
			<div class="project-info-line">{project.state.details?.details.artist.value}</div>
			<div class="project-info-line">{project.state.details?.details.label.value}</div>
			<div class="project-info-line">{project.state.details?.details.record_color.value}</div>
			<div class="flex flex-row md:flex-col justify-between">
				<img
					src={`/records/${project.state.details?.details.record_color.value || 'cosmic-black'}.png`}
					alt=""
					class="my-2 w-40"
				/>
				<img class="w-40 py-4 pr-4" src={lastTexture} alt="current texture" />
			</div>
			<div class="mt-4 flex gap-3 md:flex-col">
				<button class="project-edit-buttons delete" onclick={confirmDeleteProject}
					>Delete Project</button
				>
			</div>
		</div>

		<div class="gallery-container md:flex-[1_0_70%] md:p-4">
			<h1>Gallery</h1>
			<div class="imgs">
				{#each urls as { url, id, seed, fileName, blob }}
					{@const isGenerated = seed !== 'user-upload'}
					<div
						style={isGenerated
							? 'background-color: var(--purple);'
							: 'background-color: var(--green);color:black;l'}
						class="history-img-container flex flex-col"
						onclick={() => activateTexture(blob)}
					>
						<img src={url} alt="" class="history-img" />
						<div class="history-file-name">{fileName}</div>
						<button class="delete-button" onclick={() => confirmDeleteImg(id)}>Delete</button>
					</div>
				{/each}
			</div>
		</div>
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
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.project-edit-buttons {
		@apply mr-auto text-base;
	}
	button.delete {
		@apply text-xs text-red-500;
	}
	h1 {
		@apply mb-1 text-xl font-bold;
	}
	.imgs {
		@apply mb-4 flex flex-wrap gap-2;
	}
	.history-img-container {
		@apply flex-[0_0_47%] rounded-md p-2 md:flex-[0_0_23%];
	}
	.history-file-name {
		word-break: break-word;
		@apply my-1 text-xs;
	}
	.imgs img {
	}
	.delete-button {
		@apply mx-auto mt-auto bg-red-500 px-2 py-1 text-xs text-[var(--secondary-color)];
	}
</style>
