<script>
    import { browser } from '$app/environment';
    import { allCharacterAssets } from '$lib';
    import project from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import { onDestroy, onMount } from 'svelte';

    let {
        width = '100%',
        height = '100%',
        threeScene,
    } = $props();

    // let threeScene = new ThreeScene();

    /** @type {null | HTMLElement}*/
    let container = $state(null);
    onMount(async () => {
        if (projects.initialized === false) {
            alert('PROJECT IS NOT INITIALIZED');
        }
        init();
        async function init() {
            if (container && browser) {
                threeScene.init(container);
                threeScene.animate();
                function updateTextureWithRandomCharacter() {
                    const randomCharacterAsset =
                        allCharacterAssets[Math.floor(Math.random() * allCharacterAssets.length)];
                    threeScene.updateMaterialTexture(`/characters/${randomCharacterAsset}.png`);
                }
                updateTextureWithRandomCharacter();
            }
        }
    });

    $effect(() => {
        if (project.activeTextureUrl) {
            // Not sure why the random texture overwrites this one sometimes, so the timeout seems to solve the issue
            // or the random texture should just be part of the three initialization, and then this will gracefully overwrite it
            setTimeout(() => {
                threeScene.updateMaterialTexture(project.activeTextureUrl);
            }, 50);
        }
    });

    onDestroy(() => {
        if (threeScene) {
            threeScene.dispose();
        }
    });
</script>

<div bind:this={container} style="width: {width}; height: {height};" class="three-container"></div>

<style>
    .three-container {
        aspect-ratio: square;
        /* border: 2px solid white; */
        margin: 0 auto;
    }
</style>
