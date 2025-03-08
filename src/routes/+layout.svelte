<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import idb from '$lib/idb';
	let { children } = $props();

	onMount(() => {
	});
</script>

<img class="w-50 p-2 invert" src="logos/gn-logo.svg" />
{@render children()}
