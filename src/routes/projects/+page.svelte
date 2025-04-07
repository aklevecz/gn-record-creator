<script>
    import uploadApi from '$lib/api/upload';
    import Detail from '$lib/components/form/detail.svelte';
    import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
    import ConfirmationModal from '$lib/components/project/confirmation-modal.svelte';
    import db from '$lib/db';
    import details from '$lib/details.svelte';
    import project, { createProject } from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import { onDestroy } from 'svelte';

    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();

    // janky because it has to reset the current details applied to the current project
    // this could be inside or project.svelte
    // CREATE NEW PROJECT AND CHANGE PROJECT FUNCTIONS
    function createNewProject() {
        details.reset();
        const newProjectStore = createProject();
        const newProject = newProjectStore.create({
            details: { ...details.state },
            textures: []
        });
        projects.registerProject(newProject);
        db.saveProject(newProject);
        projects.activateProject(newProject.id);
    }

    let activeTexture = $state('/records/cosmic-black.png');

    /** @type {TextureObject[]} */
    let textureObjects = $state([]);
    $effect(() => {
        // NOT HOW THIS SHOULD BE CHECKED EXACTLY
        if (
            project.texturesLoaded
            // project.state.id &&
            // project.state.id !== currentProjectId
            // project.cachedTextures.length
        ) {
            console.log(`Generating gallery textures for projects page`)
            project.generateTextureObjectsWithUrls().then((ts) => {
                textureObjects = ts;
            });
        }
    });

    function cleanupObjectUrls() {
        console.log('Clean up object urls in projects +page');
        for (const textureObject of textureObjects) {
            URL.revokeObjectURL(textureObject.url);
        }
        // I don't think I need this because the active texture is managed by itself and revoked whenever it changes
        // URL.revokeObjectURL(activeTexture);
    }

    onDestroy(() => {
        cleanupObjectUrls()
    });

    let deleteProjectModalOpen = $state(false);
    function confirmDeleteProject() {
        if (projects.state.projects.length === 1) {
            alert(
                'You must have at least one project. Create a new one and delete this one if you really need to delete it.'
            );
            return;
        }
        deleteProjectModalOpen = true;
    }

    // DELETEING PROJECT SHOULD CLEAN UP ALL TEXTURES AS WELL
    function executeDeleteProject() {
        // could be project.delete()
        // db.deleteProject(project.state.id);
        // projects.unregisterProject(project.state.id);
        projects.deleteProject(project.state.id)
        // Activates the next project, needs to be refactored -- CHANGE PROJECT FUNCTION
        const firstProject = projects.state.projects[0];
        projects.activateProject(firstProject.id);
        cleanupObjectUrls()

        // THIS NEEDS TO BE REFACTORED, BUT ISNT AS IMPORTANT SINCE IT IS MORE RARE
        // Load in a new remaining project
        // I DONT THINK I NEED THIS IN LIEU OF THE ACTIVE PROJECT HANDLING TEXTURES NOW
        // const textureId = cachedKeys.getProjectTexture(projects.state.activeProject);
        // if (textureId) {
        //     db.getTexture(textureId).then((textureFile) => {
        //         if (!textureFile) {
        //             console.log('There is no texture file for the current texture: ', textureId);
        //             return;
        //         }
        //         const url = URL.createObjectURL(textureFile.imgFile);
        //         if (threeScenes.form) threeScenes.form.updateMaterialTexture(url);
        //     });
        // }
        deleteProjectModalOpen = false;
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
        // could be project.deleteTexture
        uploadApi.deleteTexture(`${projects.state.activeProject}/${imageToDeleteId}`);
        db.deleteTexture(imageToDeleteId);
        textureObjects = textureObjects.filter((texture) => texture.id !== imageToDeleteId);
        imageToDeleteId = '';
        deleteImageModalOpen = false;
    }

    /** @param {ArrayBuffer} arrayBuffer @param {*} fileType @param {string} id  */
    async function activateTexture(arrayBuffer, fileType, id) {
        // const blobFromBuffer = new Blob([arrayBuffer], {
        //     type: fileType
        // });
        try {
            // cachedKeys.setProjectTexture(project.state.id, id);
            project.setActiveTexture(id);
            // project.generateActiveTexture();
            // activeTextureId = id;
        } catch (error) {
            alert(`SAVE ERROR ${error}`);
        }
        // const url = URL.createObjectURL(blobFromBuffer);
        // activeTexture = url;
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
            <div class="project-info-line">{project.state.details?.artist.value}</div>
            <div class="project-info-line">{project.state.details?.label.value}</div>
            <div class="project-info-line">{project.state.details?.record_color.value}</div>
            <div class="flex flex-row justify-between md:flex-col">
                <img
                    src={`/records/${project.state.details?.record_color.value || 'cosmic-black'}.png`}
                    alt=""
                    class="my-2 w-40"
                />
                <img class="w-40 py-4 pr-4" src={project.activeTextureUrl || '/records/red-alert.png'} alt="current texture" />
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
                {#each textureObjects as { url, id, seed, fileName, arrayBuffer, fileType }}
                    {@const isGenerated = seed !== 'user-upload'}
                    {@const isActive = project.activeTextureId === id}
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
                                class="little-button"
                                >{isActive ? 'Cover Art' : 'Make Cover Art'}</button
                            >
                            <button
                                class="little-button delete-button"
                                onclick={() => confirmDeleteImg(id)}>Delete</button
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
