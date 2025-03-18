<script>
	import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
	import idb from '$lib/idb';
	import projects from '$lib/projects.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	let { children } = $props();
	onMount(() => {
		// WE COULD WAIT TO RENDER A BUNCH OF THINGS LIKE THREEJS AFTER THE DB AND PROJECTS ARE INITED
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
	<a class="w-[150px] md:w-[250px]" href="/"
		><img class="m-1 pl-2 invert" src="/logos/gn-logo.svg" alt="good neighbor logo" /></a
	>
	<nav class="md:flex-1">
		<ul class="flex justify-center gap-4">
			<li><a class="icon-link hidden md:block" href="/">home</a></li>
			<li><a class="icon-link" href="/projects">projects</a></li>
			<li><a class="icon-link" href="/studio">dream</a></li>
			<!-- <div class="flex-1"></div> -->
			<!-- <li class="opacity-0"><a href="/test">Test</a></li> -->
		</ul>
	</nav>
	<div class="md:pr-2 flex-[1_1_100px] max-w-sm">
		<ChangeProjectDropdown />
	</div>
</header>

{@render children()}

<style lang="postcss">
	@reference "tailwindcss/theme";
	.icon-link {
		transition: color 0.2s ease-in-out;
		/* filter: saturate(100%) contrast(150%) brightness(250%) blur(0px) hue-rotate(45deg); */
		/* text-decoration: underline; */
		@apply text-xs md:text-lg font-semibold;
	}
	.icon-link:hover {
		color: var(--accent-color);
	}
</style>
