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
        inset: 0;
        background: rgba(20, 20, 18, 0.55);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
    }

    .modal-container {
        background: var(--gn-paper);
        color: var(--gn-ink);
        border-radius: var(--gn-r-xl);
        box-shadow:
            0 12px 27px rgba(0, 0, 0, 0.2),
            0 49px 49px rgba(0, 0, 0, 0.17);
        max-height: 90vh;
        overflow-y: auto;
        width: 100%;
        animation: modalSlideIn 0.24s var(--gn-ease);
        font-family: var(--gn-font-sans);
    }

    .modal-sm {
        max-width: 420px;
    }
    .modal-md {
        max-width: 560px;
    }
    .modal-lg {
        max-width: 760px;
    }
    .modal-xl {
        max-width: 960px;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 28px 16px;
        border-bottom: 1px solid var(--gn-n-150);
        margin-bottom: 20px;
    }

    .modal-title {
        margin: 0;
        font-family: var(--gn-font-display);
        font-size: 28px;
        line-height: 1;
        letter-spacing: -0.02em;
        font-weight: 700;
    }

    .modal-close {
        background: transparent;
        border: 0;
        cursor: pointer;
        padding: 8px;
        color: var(--gn-fg-2);
        border-radius: var(--gn-r-full);
        transition:
            background var(--gn-dur-2) var(--gn-ease),
            color var(--gn-dur-2) var(--gn-ease);
    }
    .modal-close:hover:not(:disabled) {
        background: var(--gn-n-150);
        color: var(--gn-ink);
    }

    .modal-body {
        padding: 0 28px 8px;
        line-height: 1.5;
    }

    .modal-footer {
        padding: 20px 28px 24px;
        border-top: 1px solid var(--gn-n-150);
        margin-top: 24px;
        display: flex;
        gap: 12px;
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
