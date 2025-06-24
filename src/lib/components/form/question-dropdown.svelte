<script>
    import details from '$lib/details.svelte';
    import { formFields, recordColors } from '$lib/monday/formFields';
    import projects from '$lib/projects.svelte';
    import Modal from '../ui/modal.svelte';
    import * as Sentry from '@sentry/sveltekit';
    let { label, key, options, required, description } = $props();

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

    // Check for valid values on mount
    // Could be in the store, but this is easier? Unless I simplify the amount of loading
    // What is worth noting about this is that setValue has the nice aspect of updating the remote automatically
    // I suppose there could be a hook part of the details store that does this check on init instead
    // But the modal should be easy to track down either way
    // This has to be done after everything is fucking initialized anyway lol
    // Maybe first thing to untangle is stepping through how the remote fetching of data interacts with the local state
    let showError = $state(false);
    $effect(() => {
        if (projects.initialized) {
            const entry = details.state[key];
            if (formFields[key].options && entry.value && typeof entry.value === 'string') {
                const possibleValues = formFields[key].options.map((option) => option.value);
                if (!possibleValues.includes(entry.value)) {
                    console.log(`Invalid value for ${key}: ${entry.value} resetting value`);
                    showError = true;
                    details.setValue(key, '');
                    Sentry.captureException(new Error(`Invalid value for ${key}: ${entry.value}`));
                }
            }
        }
    });
</script>

<Modal title="Invalid Value Detected" bind:isOpen={showError} onclose={() => (showError = false)}>
    <div class="pb-10">
    <h1>The question: {formFields[key].label} was reset because of an error</h1>
    <p>Please pick a different option</p>
    <p>If you think this is a mistake or this error continues to popup please contact ari arielklevecz@gmail.com</p>
    <button class="mt-4" onclick={() => (showError = false)}>Ok</button>
    </div>
</Modal>
<div class:hidden class="flex flex-col">
    <label for={key} class="mb-0"
        >{label}{#if required}*{/if}</label
    >
    <div class="mb-2 text-xs opacity-50">{description}</div>
    <select
        id={key}
        name={key}
        onchange={onChange}
        bind:value={details.state[key].value}
        class="mt-2 w-full max-w-[300px] rounded-xs border-1 border-white px-2 py-1 text-lg"
    >
        {#each options as option}
            <option value={option.value}>{option.text}</option>
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
