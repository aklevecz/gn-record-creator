<script>
    import details from '$lib/details.svelte';

    let { label, key, options } = $props();

    /** @param {*} e */
    function onChange(e) {
        details.setValue(key, e.target.value);
    }
</script>

<div class="flex flex-col">
    <label for={key} class="mb-0">{label}</label>
    <select
        id={key}
        name={key}
        onchange={onChange}
        bind:value={details.state[key].value}
        class="w-full max-w-[300px] rounded-xs border-1 border-white px-2 py-1 text-lg"
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
        @apply w-full max-w-[300px] rounded-xs border-1 border-white px-2 py-1 text-lg;
    }
</style>
