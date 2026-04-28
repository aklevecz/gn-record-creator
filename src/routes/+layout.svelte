<script>
    import { browser } from '$app/environment';
    import projectsApi from '$lib/api/projects';
    import surveyApi from '$lib/api/survey';
    import CarbonVignette from '$lib/components/info/carbon-vignette.svelte';
    import ChangeProjectDropdown from '$lib/components/project/change-project-dropdown.svelte';
    import details, { unmapDetails } from '$lib/details.svelte';
    import idb from '$lib/idb';
    import projects from '$lib/projects.svelte';
    import { onDestroy, onMount } from 'svelte';
    import '../app.css';
    import network from '$lib/network.svelte';
    import posthog from 'posthog-js'
    import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
    import project from '$lib/project.svelte';

    let { children } = $props();

    onMount(() => {
        // WE COULD WAIT TO RENDER A BUNCH OF THINGS LIKE THREEJS AFTER THE DB AND PROJECTS ARE INITED
        if (browser) {
            idb.init().then(() => {
                projects.init();
            });
            window.addEventListener('beforeunload', () => {
                // if (projects.activeProject) await db.saveProject(projects.activeProject);
                idb.close();
            });
            network.init();

            posthog.init(PUBLIC_POSTHOG_KEY, {
                api_host: 'https://us.i.posthog.com',
                person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
            });
        }
    });

    // THESE SHOULD PROBABLY BE PART OF THE INIT?
    // AND INIT SHOULD HAVE SOME LOGIC THAT IS TRIGGERED BY PROJECT CHANGES?
    // ARE THERE OTHER CASES THAT THE PROJECT WOULD CHANGE?
    // FETCHES PROJECTS BY SESSION
    async function fetchRemoteProjects() {
        projectsApi.getProjects().then((fetchedProjects) => {
            for (const project of fetchedProjects) {
                // THIS WILL NEED TO ACCOUNT FOR ARRAYS BEING SAVED AS JOINED STRINGS
                const details = unmapDetails(project);
                projects.registerProject({
                    id: project.id,
                    mondayId: project.mondayId,
                    version: project.version,
                    name: project.title,
                    createdAt: new Date(),
                    pricing: {
                        ...project.pricing
                    },
                    carbonSavings: {
                        ...project.carbon_savings
                    },
                    textures: [],
                    details,
                    hasSubmitted: false
                });
            }
        });
    }

    /** @param {string} projectId */
    async function fetchRemoteSurvey(projectId) {
        try {
            const remoteSurveyData = await surveyApi.get(projectId);
            if (!remoteSurveyData) {
                console.log('No remote survey data for project:', projectId);
                return null;
            }
            // weak update if remote has newer data some how i dunno
            console.log("Updating details from remote:", remoteSurveyData);
            for (const entry of Object.entries(details.state)) {
                const [key, value] = entry;
                const remoteValue = remoteSurveyData[key];
                const localValue = value.value;
                if (!localValue && remoteValue) {
                    details.setValue(key, remoteValue);
                }
            }
        } catch (/** @type {any} */ e) {
            throw new Error(e);
        }
    }
    // Local detail updates go
    // details -> project -> projects
    // this is ugly, because details updates projects and it tries to update again
    // the logic stops it from an infinite loop, but should probably abstract this and fetch on project init and then when it is changed explicitly
    let lastProjectId = '';
    $effect(() => {
        if (!projects.initialized) return;
        const projectId = projects.activeProject?.id;
        if (!projectId) {
            console.log('No active project');
            return;
        }
        if (projectId === lastProjectId) {
            console.log('Project id did not change');
            return;
        }
        projects.checkProjectSubmittedStatus(projectId).then((res) => {
            console.log(`Project submitted status: ${res}`);
            if (res.data?.currentStatus === 'Submitted') {
                project.state.hasSubmitted = true;
            }
        })
        fetchRemoteSurvey(projectId);
        lastProjectId = projectId;
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
<header class="gn-header">
    <a class="logo" href="/">
        <img src="/logos/gn-logo.svg" alt="good neighbor logo" />
    </a>
    <nav>
        <ul>
            <li><a class="icon-link" href="/">order form</a></li>
            <li><a class="icon-link" href="/projects">projects</a></li>
            <li><a class="icon-link" href="/studio">dream</a></li>
        </ul>
    </nav>
    <div class="project-picker">
        <ChangeProjectDropdown />
    </div>
</header>

{@render children()}

<CarbonVignette />

<style>
    .gn-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 20px;
        background: var(--gn-paper);
        border-bottom: 1px solid var(--gn-n-150);
    }
    .logo {
        display: inline-flex;
        flex-shrink: 0;
        width: 150px;
    }
    .logo img {
        width: 100%;
        height: auto;
        display: block;
    }
    nav {
        flex: 1;
    }
    nav ul {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }
    .icon-link {
        font-family: var(--gn-font-sans);
        font-weight: 700;
        font-size: 14px;
        letter-spacing: -0.024em;
        color: var(--gn-ink);
        padding: 8px 16px;
        border-radius: var(--gn-r-full);
        text-decoration: none;
        transition:
            background var(--gn-dur-2) var(--gn-ease),
            color var(--gn-dur-2) var(--gn-ease);
    }
    .icon-link:hover {
        background: var(--gn-ink);
        color: var(--gn-paper);
    }
    .project-picker {
        flex: 0 1 240px;
    }
    @media (min-width: 768px) {
        .logo {
            width: 220px;
        }
        .icon-link {
            font-size: 16px;
            padding: 10px 22px;
        }
    }
    @media (max-width: 540px) {
        .gn-header {
            padding: 10px 12px;
            gap: 8px;
        }
        .logo {
            width: 110px;
        }
        nav ul li:first-child {
            display: none;
        }
    }
</style>
