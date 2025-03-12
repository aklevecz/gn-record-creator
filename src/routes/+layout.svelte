<script>
	import { onMount } from 'svelte';
	import '../app.css';
	let { children } = $props();

	onMount(() => {});
</script>

<header class="flex items-center gap-4">
	<a href="/"
		><img class="w-60 m-1 p-2 invert" src="/logos/gn-logo.svg" alt="good neighbor logo" /></a
	>
	<nav class=" w-full">
		<ul class="flex gap-4">
			<li><a class="studio-link" href="/studio">🌸</a></li>
			<div class="flex-1"></div>
			<li class="opacity-0"><a href="/test">Test</a></li>
		</ul>
	</nav>
</header>

{@render children()}

<style>
	.studio-link {
		filter: saturate(100%) contrast(150%) brightness(250%) blur(.75px) hue-rotate(45deg);
		font-size: 1rem;
	}
</style>
