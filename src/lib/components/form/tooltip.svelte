<script>
    import { slide } from 'svelte/transition';

    /** @type {{tooltip: Tooltip}} props */
    const { tooltip } = $props();

    let isOpen = $state(false);

    function toggleOpen() {
        isOpen = !isOpen;
    }
</script>

<div class="relative">
    <!-- <div class="tooltip-container" class:open={isOpen}> -->
    {#if isOpen}
        <div transition:slide class="tooltip-container">
            <div>{tooltip.description}</div>
            <!-- <a target="_blank" href={tooltip.link} aria-label="see more info on {tooltip.name}"
                >External info</a
            > -->
        </div>
    {/if}
    <button onclick={toggleOpen}
        >{#if !isOpen}{tooltip.cta}{:else}Hide{/if}</button
    >
</div>

<style>
    .tooltip-container {
        display: block;
        width: fit-content;
        background: var(--gn-ink);
        color: var(--gn-paper);
        padding: 10px 14px;
        border-radius: var(--gn-r-sm);
        margin-bottom: 8px;
        font-size: 13px;
        line-height: 1.4;
    }
    button {
        font-size: 12px;
        padding: 6px 14px;
        background: transparent;
        color: var(--gn-fg-2);
        text-decoration: underline;
    }
    button:hover:not(:disabled) {
        background: transparent;
        color: var(--gn-ink);
    }
    a {
        color: var(--gn-lilac);
        text-decoration: underline;
    }
</style>
