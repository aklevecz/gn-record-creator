<script>
	import details from '$lib/details.svelte';

	let { label, key, description } = $props();

	/** @param {*} e */
	function onInput(e) {   
		details.setValue(key, e.target.value);
	}

	let type = 'text'
	if (key==='contact_email') {
		type = 'email'
	}

	if (key === 'phone') {
		type = 'tel'
	}
</script>

<div class="flex flex-col">
	<label for={key} class="mb-0"
    >{label}</label>
	<div class="opacity-50 text-xs mb-2">{description}</div>
	<input id={key} name={key} type={type} oninput={onInput} autocomplete="on" bind:value={details.state.details[key].value} />
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
