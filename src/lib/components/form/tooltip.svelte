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
            <!-- <div>{tooltip.name}</div> -->
            <div>{tooltip.description}</div>
            <a target="_blank" href={tooltip.link} aria-label="see more info on {tooltip.name}"
                >External info</a
            >
        </div>
    {/if}
    <button onclick={toggleOpen}
        >{#if !isOpen}{tooltip.cta}{:else}Hide{/if}</button
    >
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    .tooltip-container {
        @apply  rounded-md mb-2 bg-[var(--secondary-color)] p-2 text-[var(--primary-color)] block w-fit;
    }
    button {
        @apply text-xs;
    }
    a {
        @apply text-[var(--accent-color)] underline;
    }
    /* .hidden {
        @apply hidden;
    } */
</style>
