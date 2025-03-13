<script>
	import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
	import idb from '$lib/idb';
	import projects from '$lib/projects.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	let { children } = $props();

	onMount(() => {
		idb.init().then(() => {
			projects.init();
		});
	});
</script>

<svelte:head>
	<title>good neighbor record creator</title>
	<meta name="description" content="good neighbor record creator" />
	<meta name="og:title" content="good neighbor record creator" />
	<meta name="og:description" content="good neighbor record creator" />
	<meta name="og:image" content="/records/purple-haze.png" />
</svelte:head>
<header class="flex items-center gap-4">
	<a class="w-[150px]" href="/"
		><img class="m-1 pl-2 invert" src="/logos/gn-logo.svg" alt="good neighbor logo" /></a
	>
	<nav class="">
		<ul class="flex gap-4">
			<li><a class="icon-link" href="/studio">gen</a></li>
			<li><a class="icon-link" href="/projects">projects</a></li>
			<!-- <div class="flex-1"></div> -->
			<li class="opacity-0"><a href="/test">Test</a></li>
		</ul>
	</nav>
	<div>
		<ChangeProjectDropdown />
	</div>
</header>

{@render children()}

<style>
	.icon-link {
		filter: saturate(100%) contrast(150%) brightness(250%) blur(0px) hue-rotate(45deg);
		font-size: .75rem;
		text-decoration: underline;
	}
</style>
