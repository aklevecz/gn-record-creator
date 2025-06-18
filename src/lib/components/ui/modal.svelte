<script>
    import { browser } from '$app/environment';

    let {
        isOpen = $bindable(false),
        title = '',
        size = 'md', // 'sm', 'md', 'lg', 'xl'
        closeOnBackdrop = true,
        showCloseButton = true,
        onclose
    } = $props();

    function handleBackdropClick() {
        if (closeOnBackdrop) {
            close();
        }
    }

    function close() {
        isOpen = false;
        onclose?.();
    }

    /** @param {KeyboardEvent} event */
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            close();
        }
    }

    $effect(() => {
        if (browser) {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
        <div
            class="modal-container modal-{size}"
            on:click|stopPropagation
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            {#if title || showCloseButton}
                <div class="modal-header">
                    {#if title}
                        <h2 id="modal-title" class="modal-title">{title}</h2>
                    {/if}
                    {#if showCloseButton}
                        <button class="modal-close" on:click={close} aria-label="Close modal">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    {/if}
                </div>
            {/if}

            <div class="modal-body">
                <slot />
            </div>

            {#if $$slots.footer}
                <div class="modal-footer">
                    <slot name="footer" />
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-container {
        background: var(--primary-color);
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-height: 90vh;
        overflow-y: auto;
        width: 100%;
        animation: modalSlideIn 0.2s ease-out;
    }

    .modal-sm {
        max-width: 400px;
    }
    .modal-md {
        max-width: 500px;
    }
    .modal-lg {
        max-width: 700px;
    }
    .modal-xl {
        max-width: 900px;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 1.5rem 0 1.5rem;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
    }

    .modal-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .modal-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        color: #6c757d;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .modal-close:hover {
        background: #f8f9fa;
        color: #333;
    }

    .modal-body {
        padding: 0 1.5rem;
    }

    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e0e0e0;
        margin-top: 1.5rem;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        .modal-container {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
        }

        .modal-sm,
        .modal-md,
        .modal-lg,
        .modal-xl {
            max-width: 100%;
        }
    }
</style>
