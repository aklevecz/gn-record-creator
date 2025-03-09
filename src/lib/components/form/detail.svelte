<script>
	import details from '$lib/details.svelte';

	let { label = 'Company Name', key = 'company_name' } = $props();

	/** @param {*} e */
	function onInput(e) {   
		details.set(key, e.target.value);
	}
</script>

<div class="flex flex-col">
	<label for={key} class="mb-1"
    >{label}</label>
	<input name={key} oninput={onInput} type="text" />
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    label {
        @apply font-semibold;
    }
	input {
        @apply border-1 border-white w-full text-lg px-2 py-1 max-w-[300px];
	}
</style>
