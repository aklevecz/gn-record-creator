<script>
	import { CURRENT_TEXTURE } from '$lib';
	import Detail from '$lib/components/form/detail.svelte';
	import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
	import ConfirmationModal from '$lib/components/project/confirmation-modal.svelte';
	import db from '$lib/db';
	import details from '$lib/details.svelte';
	import project, { createProject } from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import { cachedKeys } from '$lib/storage';
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
		const newProjectStore = createProject();
		const newProject = newProjectStore.create({
			details: { ...details.state }
			// survey: { ...survey.state }
		});
		projects.registerProject(newProject);
		// idb.addProject(newProject);
		db.saveProject(newProject);
		projects.activateProject(newProject.id);
	}

	let lastTexture = $state('/records/cosmic-black.png');

	/** @type {{file: File, type: string}[]} */
	let uploadedImgUrls = $state([]);
	// /** @type {string[]} */
	// let generatedImgUrls = $state([]);
	/** @type {{url:string, id: string, seed:string, fileName: string, blob: Blob, arrayBuffer: ArrayBuffer, fileType: string}[]} */
	let urls = $state([]);

	let activeTextureId = $state('');
	// weak onMount after project is initited
	let currentProjectId = $state('');
	$effect(() => {
		if (project.state.id && project.state.id !== currentProjectId) {
			currentProjectId = project.state.id;
			// GALLERY TEXTURES
			db.getTexturesByProjectId(project.state.id).then((cachedTextures) => {
				// urls = cachedTextures.map((texture) => ({
				// 	url: texture
				// }))
				// return
				urls = cachedTextures.map((texture) => {
					const blobFromBuffer = new Blob([texture.arrayBuffer], { type: texture.imgFile.type });
					const url = URL.createObjectURL(blobFromBuffer);
					return {
						url,
						id: texture.id,
						seed: texture.seed,
						fileName: texture.fileName,
						blob: texture.imgFile,
						arrayBuffer: texture.arrayBuffer,
						fileType: texture.fileType
					};
				});

				const currentProjectTexture = cachedKeys.getProjectTexture(project.state.id);

				activeTextureId = currentProjectTexture || 'last-texture';
				db.getTexture(activeTextureId).then((activeTextureArrayBuffer) => {
					if (activeTextureArrayBuffer) {
						const blobFromBuffer = new Blob([activeTextureArrayBuffer], {
							type: 'image/png'
						});
						const url = URL.createObjectURL(blobFromBuffer);
						lastTexture = url;
					}
				});
			});
		}
	});

	let deleteProjectModalOpen = $state(false);
	function confirmDeleteProject() {
		deleteProjectModalOpen = true;
	}

	function executeDeleteProject() {
		projects.removeProject(project.state.id);
		db.deleteProject(project.state.id);
		const firstProject = projects.state.projects[0];
		projects.activateProject(firstProject.id);
		db.getTexture(`${projects.activeProject?.id}-${CURRENT_TEXTURE}`).then((textureFile) => {
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

		db.deleteTexture(imageToDeleteId);
		urls = urls.filter((url) => url.id !== imageToDeleteId);
		imageToDeleteId = '';
		deleteImageModalOpen = false;
	}

	/** @param {ArrayBuffer} arrayBuffer @param {*} fileType @param {string} id  */
	async function activateTexture(arrayBuffer, fileType, id) {
		const blobFromBuffer = new Blob([arrayBuffer], {
			type: fileType
		});
		try {
			db.saveTexture('last-texture', blobFromBuffer, {
				seed: 'user-upload',
				projectId: 'active'
			});
			cachedKeys.setProjectTexture(project.state.id, id);
			activeTextureId = id
		} catch (error) {
			alert(`SAVE ERROR ${error}`);
		}
		const url = URL.createObjectURL(blobFromBuffer);
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
			<!-- <div class="text-xl">{project.state.name}</div> -->
			<div class="mb-2 pr-4">
				<Detail label="Project Name" key="project_name" description="" />
			</div>
			<div class="project-info-line">{project.state.details?.details.artist.value}</div>
			<div class="project-info-line">{project.state.details?.details.label.value}</div>
			<div class="project-info-line">{project.state.details?.details.record_color.value}</div>
			<div class="flex flex-row justify-between md:flex-col">
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
				{#each urls as { url, id, seed, fileName, blob, arrayBuffer, fileType }}
					{@const isGenerated = seed !== 'user-upload'}
					{@const isActive = activeTextureId === id}
					<div
						style={isGenerated
							? 'background-color: var(--purple);'
							: 'background-color: var(--green);color:black;l'}
						class="history-img-container flex flex-col"
					>
						<img src={url} alt="" class="history-img" />
						<div class="history-file-name">{fileName}</div>
						<div>
							<button
								class:is_active={isActive}
								disabled={isActive}
								onclick={() => activateTexture(arrayBuffer, fileType, id)}
								class="little-button">{isActive ? 'Active' : 'Activate'}</button
							>
							<button class="little-button delete-button" onclick={() => confirmDeleteImg(id)}
								>Delete</button
							>
						</div>
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
	.little-button {
		@apply mx-auto mt-auto px-2 py-1 text-xs;
	}
	.delete-button {
		@apply bg-red-500 text-[var(--secondary-color)];
	}
	.is_active {
		@apply opacity-30;
	}
</style>
