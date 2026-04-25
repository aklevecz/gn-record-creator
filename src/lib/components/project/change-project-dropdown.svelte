<script>
    import projects from '$lib/projects.svelte';

    /** @param {*} e */
    async function onChangeProject(e) {
        const projectId = e.target.value;
        projects.activateProject(projectId);
    }
</script>

<div class="project-dropdown">
    <select
        name="change-project-dropdown"
        bind:value={projects.state.activeProject}
        onchange={onChangeProject}
    >
        <option value="" disabled>Select a project</option>
        {#each projects.state.projects as project}
            <option value={project.id}>{project.name}</option>
        {/each}
    </select>
    <svg class="caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
</div>

<style>
    .project-dropdown {
        position: relative;
        display: block;
        width: 100%;
    }
    select {
        width: 100%;
        appearance: none;
        padding-right: 36px;
    }
    .caret {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        width: 14px;
        height: 14px;
        fill: var(--gn-ink);
        pointer-events: none;
    }
</style>
