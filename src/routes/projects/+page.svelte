<script>
    import { goto } from '$app/navigation';
    import uploadApi from '$lib/api/upload';
    import Detail from '$lib/components/form/detail.svelte';
    import ConfirmationModal from '$lib/components/project/confirmation-modal.svelte';
    import ProjectCreationModal from '$lib/components/project/project-creation-modal.svelte';
    import db from '$lib/db';
    import details from '$lib/details.svelte';
    import { formFields } from '$lib/monday/formFields';
    import project, { createProject } from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import { onDestroy } from 'svelte';

    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();

    // janky because it has to reset the current details applied to the current project
    // this could be inside or project.svelte
    // CREATE NEW PROJECT AND CHANGE PROJECT FUNCTIONS
    let createProjectModalOpen = $state(false);

    function openCreateProjectModal() {
        createProjectModalOpen = true;
    }

    /** @param {string} projectName */
    function createNewProject(projectName) {
        details.reset();
        const newProjectStore = createProject();
        const newProject = newProjectStore.create({
            details: {
                ...details.state
            },
            textures: []
        });
        projects.registerProject(newProject);
        db.saveProject(newProject);
        projects.activateProject(newProject.id);
        createProjectModalOpen = false;
        goto('/');
        details.setValue('title', projectName);
    }

    /** @type {TextureObject[]} */
    let textureObjects = $state([]);
    $effect(() => {
        console.log(``)
        // NOT HOW THIS SHOULD BE CHECKED EXACTLY
        if (
            project.texturesLoaded
            // project.state.id &&
            // project.state.id !== currentProjectId
            // project.cachedTextures.length
        ) {
            console.log(`Generating gallery textures for projects page`);
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
        cleanupObjectUrls();
    });

    let deleteProjectModalOpen = $state(false);
    function confirmDeleteProject() {
        if (projects.state.projects.length === 1) {
            alert('You must have at least one project. Create a new one and delete this one if you really need to delete it.');
            return;
        }
        deleteProjectModalOpen = true;
    }

    // DELETEING PROJECT SHOULD CLEAN UP ALL TEXTURES AS WELL
    function executeDeleteProject() {
        // could be project.delete()
        // db.deleteProject(project.state.id);
        // projects.unregisterProject(project.state.id);
        projects.deleteProject(project.state.id);
        // Activates the next project, needs to be refactored -- CHANGE PROJECT FUNCTION
        const firstProject = projects.state.projects[0];
        projects.activateProject(firstProject.id);
        cleanupObjectUrls();

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
    let titleEditMode = $state(false);
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
<ProjectCreationModal isOpen={createProjectModalOpen} onConfirm={createNewProject} onCancel={() => (createProjectModalOpen = false)} />

<div class="mx-auto mb-10 rounded-md p-3 px-6">
    <h1>Project Editor</h1>
    
    <div class="create-project-section">
        <div class="create-project-content">
            <h2 class="create-project-title">Start a New Project</h2>
            <p class="create-project-description">Create a new project and organize multiple record ideas at once</p>
            <button class="create-project-btn" onclick={openCreateProjectModal}>
                <span class="create-icon">+</span>
                Create New Project
            </button>
        </div>
    </div>
    <div class="flex min-h-[80vh] flex-col gap-6 md:flex-row md:pt-6">
        <div class="project-info-sidebar flex w-full flex-col gap-4 md:min-w-[250px] md:flex-[0_1_25%] md:border-r md:border-white/20 md:pr-6">
            <div class="project-info-section">
                <h2 class="section-header">Current Project</h2>
                
                <div class="project-title-section">
                    {#if titleEditMode}
                        <Detail label="Title" key="title" description="" type="text" required={false} />
                        <div class="title-edit-controls">
                            <button class="title-save-btn" onclick={() => titleEditMode = false}>Save</button>
                            <button class="title-cancel-btn" onclick={() => titleEditMode = false}>Cancel</button>
                        </div>
                    {:else}
                        <div class="title-display">
                            <div class="title-text">
                                {project.state.details?.title?.value || 'Untitled Project'}
                            </div>
                            <button class="title-edit-btn" onclick={() => titleEditMode = true}>Edit</button>
                        </div>
                    {/if}
                </div>
                
                <div class="project-metadata">
                    <div class="metadata-grid">
                        {#if project.state.details?.artist.value}
                            <div class="metadata-item">
                                <div class="metadata-label">Artist</div>
                                <div class="metadata-value">{project.state.details.artist.value}</div>
                            </div>
                        {/if}
                        {#if project.state.details?.label.value}
                            <div class="metadata-item">
                                <div class="metadata-label">Label</div>
                                <div class="metadata-value">{project.state.details.label.value}</div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <div class="project-preview-section">
                <div class="preview-images">
                    <div class="record-preview">
                        <img
                            src={formFields.record_color.options?.find((o) => o.text === project.state.details?.record_color.value)?.img ||
                                '/records/cosmic-black.png'}
                            alt="Record color preview"
                            class="record-image"
                        />
                    </div>
                    {#if project.activeTextureUrl}
                        <div class="texture-preview">
                            <img
                                class="texture-image"
                                src={project.activeTextureUrl || '/records/red-alert.png'}
                                alt="Current cover art"
                            />
                        </div>
                    {/if}
                </div>
            </div>

            <div class="project-actions">
                <button class="delete-project-btn" onclick={confirmDeleteProject}>Delete Project</button>
            </div>
        </div>

        <div class="gallery-container md:flex-[1_0_70%]">
            <h1>Gallery</h1>
            <div class="imgs">
                {#each textureObjects as { url, id, seed, fileName, arrayBuffer, fileType }}
                    {@const isGenerated = seed !== 'user-upload'}
                    {@const isActive = project.activeTextureId === id}
                    <div
                        style={isGenerated ? 'background-color: var(--purple);' : 'background-color: var(--green);color:black;l'}
                        class="history-img-container flex flex-col"
                    >
                        <img src={url} alt="" class="history-img" />
                        <div class="history-file-name">{fileName}</div>
                        <div class="mt-2 h-full flex items-end">
                            <button
                                class:is_active={isActive}
                                disabled={isActive}
                                onclick={() => activateTexture(arrayBuffer, fileType, id)}
                                class="little-button">{isActive ? 'Cover Art' : 'Make Cover'}</button
                            >
                            <button class="little-button delete-button" onclick={() => confirmDeleteImg(id)}>Delete</button>
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

    /* Create Project Section */
    .create-project-section {
        @apply mb-8 border border-white/20 rounded-lg p-6;
    }
    
    .create-project-content {
        @apply text-center;
    }
    
    .create-project-title {
        @apply text-xl font-semibold mb-2;
    }
    
    .create-project-description {
        @apply text-sm opacity-75 mb-4;
    }
    
    .create-project-btn {
        @apply inline-flex items-center gap-2 px-6 py-3 text-base font-medium border border-white/30 rounded-md hover:bg-white/10 transition-colors;
    }
    
    .create-icon {
        @apply text-lg font-bold;
    }
    
    /* Sidebar Styles */
    .section-header {
        @apply text-lg font-semibold mb-4 pb-2 border-b border-white/10;
    }
    
    .project-title-section {
        @apply mb-6;
    }
    
    .title-display {
        @apply flex items-center justify-between p-3 border border-white/10 rounded-md;
    }
    
    .title-text {
        @apply text-base font-medium;
    }
    
    .title-edit-btn {
        @apply px-2 py-1 text-xs font-medium border border-white/20 rounded hover:bg-white/10 transition-colors;
    }
    
    .title-edit-controls {
        @apply flex gap-2 mt-2;
    }
    
    .title-save-btn {
        @apply px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors;
    }
    
    .title-cancel-btn {
        @apply px-3 py-1 text-xs font-medium border border-white/20 rounded hover:bg-white/10 transition-colors;
    }
    
    .project-metadata {
        @apply mb-6;
    }
    
    .metadata-grid {
        @apply space-y-4;
    }
    
    .metadata-item {
        @apply border-l-2 border-white/20 pl-3;
    }
    
    .metadata-label {
        @apply text-xs font-medium uppercase tracking-wide opacity-60 mb-1;
    }
    
    .metadata-value {
        @apply text-sm font-medium;
    }
    
    .preview-header {
        @apply text-sm font-medium mb-3 pb-2 border-b border-white/10 opacity-75;
    }
    
    .preview-images {
        @apply flex flex-col gap-3;
    }
    
    .record-preview, .texture-preview {
        @apply flex justify-center;
    }
    
    .record-image, .texture-image {
        @apply w-32 h-32 object-cover rounded-md;
    }
    
    .delete-project-btn {
        @apply w-full px-4 py-2 text-sm text-red-400 border border-red-400/30 rounded-md hover:bg-red-400/10 transition-colors;
    }
    
    /* Gallery Styles */
    h1 {
        @apply mb-4 text-xl font-bold;
    }
    .imgs {
        @apply mb-4 flex flex-wrap gap-2;
    }
    .history-img-container {
        @apply flex-[0_0_47%] rounded-md p-4 md:flex-[0_0_23%];
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
