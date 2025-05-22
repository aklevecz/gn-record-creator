<script>
    import details from '$lib/details.svelte';
    import { recordColors } from '$lib/form-data-model';

    let { label, key, options, required } = $props();

    /** @param {*} e */
    function onChange(e) {
        details.setValue(key, e.target.value);
    }

    // Conditional rendering of question
    let hidden = $state(false);
    $effect(() => {
        if (key === 'opacity') {
            if (details.state.record_color.value === recordColors.glassyIce || details.state.record_color.value === recordColors.lightning) {
                hidden = true;
            } else {
                hidden = false;
            }
        }
    });
</script>

<div class:hidden class="flex flex-col">
    <label for={key} class="mb-0"
        >{label}{#if required}*{/if}</label
    >
    <select
        id={key}
        name={key}
        onchange={onChange}
        bind:value={details.state[key].value}
        class="mt-2 w-full max-w-[300px] rounded-xs border-1 border-white px-2 py-1 text-lg"
    >
        {#each options as option}
            <option value={option.text}>{option.text}</option>
        {/each}
    </select>
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    label {
        @apply font-semibold;
    }
    select {
        @apply w-full max-w-[300px] appearance-none rounded-xs border-1 border-white bg-no-repeat px-2 py-1 text-lg;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-position: right 0.5rem center;
        background-size: 1em 1em;
        padding-right: 2.5rem;
    }
    .hidden {
        display: none;
    }
</style>
