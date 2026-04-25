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

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(20, 20, 18, 0.55);
        backdrop-filter: blur(4px);
        padding: 16px;
    }
    .modal {
        background: var(--gn-paper);
        color: var(--gn-ink);
        border-radius: var(--gn-r-xl);
        padding: 28px;
        width: 100%;
        max-width: 440px;
        box-shadow:
            0 12px 27px rgba(0, 0, 0, 0.2),
            0 49px 49px rgba(0, 0, 0, 0.17);
        font-family: var(--gn-font-sans);
    }
    .modal-header {
        margin-bottom: 12px;
    }
    .modal-header h2 {
        font-family: var(--gn-font-display);
        font-size: 28px;
        line-height: 1;
        letter-spacing: -0.02em;
        margin: 0;
    }
    .modal-body {
        margin-bottom: 20px;
    }
    .modal-body p {
        color: var(--gn-fg-2);
        margin: 0 0 12px;
    }
    .project-name-input {
        width: 100%;
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    .cancel-button {
        background: var(--gn-paper);
        color: var(--gn-ink);
        box-shadow: inset 0 0 0 1px var(--gn-ink);
    }
    .cancel-button:hover:not(:disabled) {
        background: var(--gn-n-150);
    }
    .confirm-button {
        background: var(--gn-sunshine);
        color: var(--gn-ink);
    }
    .confirm-button:hover:not(:disabled) {
        background: var(--gn-sunshine-2);
    }
</style>
