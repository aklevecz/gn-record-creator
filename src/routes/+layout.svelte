<script>
	import { browser } from '$app/environment';
	import surveyApi from '$lib/api/survey';
	import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
	import db from '$lib/db';
	import details from '$lib/details.svelte';
	import idb from '$lib/idb';
	import projects from '$lib/projects.svelte';
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		// projectsApi.getProjects().then((fetchedProjects) => {
		// 	for (const project of fetchedProjects) {
		// 		const details = unmapDetails(project);
		// 		console.log(details);
		// 		projects.registerProject({
		// 			id: project.id,
		// 			name: project.project_name,
		// 			details: { details }
		// 		});
		// 	}
		// });
		// WE COULD WAIT TO RENDER A BUNCH OF THINGS LIKE THREEJS AFTER THE DB AND PROJECTS ARE INITED
		idb.init().then(() => {
			projects.init();
		});
		if (browser) {
			window.addEventListener('beforeunload', () => {
				if (projects.activeProject) db.saveProject(projects.activeProject);
				idb.close();
			});
		}
	});

	// Local detail updates go
	// details -> project -> projects
	// this is ugly, because details updates projects and it tries to update again
	// the logic stops it from an infinite loop, but should probably abstract this and fetch on project init and then when it is changed explicitly
	let lastProjectId = '';
	$effect(() => {
		if (!projects.state.initialized) return;
		if (projects.activeProject?.id && projects.activeProject?.id !== lastProjectId) {
			lastProjectId = projects.activeProject?.id;
			surveyApi.get(projects.activeProject.id).then((remoteSurveyData) => {
				if (!remoteSurveyData) return null;
				console.log('Remote survey data', remoteSurveyData);
				// weak update if remote has newer data some how i dunno
				for (const entry of Object.entries(details.state.details)) {
					const [key, value] = entry;
					const remoteValue = remoteSurveyData[key];
					const localValue = value.value;
					if (!localValue && remoteValue) {
						details.setValue(key, remoteValue);
					}
				}
			});
		} else {
			if (!projects.activeProject?.id) {
				console.log('No active project');
			}
			if (projects.activeProject?.id === lastProjectId) {
				console.log('Project id did not change');
			}
		}
	});

	onDestroy(() => {
		if (browser) {
			idb.close();
		}
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
	<div class="max-w-sm flex-[1_1_100px] md:pr-2">
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
		@apply text-xs font-semibold md:text-lg;
	}
	.icon-link:hover {
		color: var(--accent-color);
	}
</style>
