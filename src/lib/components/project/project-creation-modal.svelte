<script>
    
    let { isOpen, onConfirm, onCancel } = $props();

    let projectName = $state('');

    function handleSubmit() {
        if (projectName.trim()) {
            onConfirm(projectName.trim());
            projectName = '';
        }
    }

    function handleCancel() {
        projectName = '';
        onCancel();
    }

	/** @param {KeyboardEvent} event */
    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    }

	/** @param {MouseEvent} event */
    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            handleCancel();
        }
    }

    /** @param {KeyboardEvent} event */
    function handleBackdropKeyDown(event) {
        if (event.key === 'Escape') {
            handleCancel();
        }
    }
</script>

{#if isOpen}
    <div class="modal-backdrop" onclick={handleBackdropClick} onkeydown={handleBackdropKeyDown} role="button" tabindex="0">
        <div class="modal">
            <div class="modal-header">
                <h2>Create New Project</h2>
            </div>
            <div class="modal-body">
                <p class="mb-3">Enter a name for your new project:</p>
                <input
                    type="text"
                    bind:value={projectName}
                    placeholder="Project name"
                    class="project-name-input"
                    onkeydown={handleKeyDown}
                />
            </div>
            <div class="modal-footer">
                <button class="cancel-button" onclick={handleCancel}>Cancel</button>
                <button class="confirm-button" onclick={handleSubmit} disabled={!projectName.trim()}> Create Project </button>
            </div>
        </div>
    </div>
{/if}

<style lang="postcss">
    @reference "tailwindcss/theme";

    .modal-backdrop {
        @apply fixed inset-0 z-50 flex items-center justify-center bg-black/50;
    }

    .modal {
        @apply mx-4 w-full max-w-sm rounded-md bg-white p-4 text-black;
    }

    .modal-header {
        @apply mb-2;
    }

    .modal-header h2 {
        @apply text-lg font-bold;
    }

    .modal-body {
        @apply mb-4;
    }

    .project-name-input {
        @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--purple)] focus:ring-1 focus:ring-[var(--purple)] focus:outline-none;
    }

    .modal-footer {
        @apply flex justify-end gap-2;
    }

    .cancel-button {
        @apply rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300;
    }

    .confirm-button {
        @apply rounded-md bg-[var(--purple)] px-4 py-2 text-sm text-white hover:bg-[var(--green)] disabled:cursor-not-allowed disabled:bg-gray-400;
    }
</style>
