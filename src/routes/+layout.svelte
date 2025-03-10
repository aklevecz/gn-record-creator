<script>
	import { onMount } from 'svelte';
	import '../app.css';
	let { children } = $props();

	onMount(() => {});
</script>

<header class="flex items-center">
	<img class="h-[40px] w-50 p-2 invert" src="logos/gn-logo.svg" alt="good neighbor logo"/>
	<nav>
		<ul class="flex gap-4">
			<li><a href="/">Home</a></li>
			<li><a href="/studio">Studio</a></li>
			<li><a href="/test">Test</a></li>
		</ul>
	</nav>
</header>

{@render children()}
