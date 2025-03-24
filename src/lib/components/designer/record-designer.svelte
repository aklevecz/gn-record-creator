<script>
    import { browser } from '$app/environment';
    import { allCharacterAssets } from '$lib';
    import project from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import ThreeScene from '$lib/ThreeScene';
    import { onDestroy, onMount } from 'svelte';

    let {
        width = '100%',
        height = '100%',
        threeScene = new ThreeScene(),
        loadCachedType = 'texture'
    } = $props();

    /** @type {null | HTMLElement}*/
    let container = $state(null);
    onMount(async () => {
        if (projects.state.initialized === false) {
            alert('PROJECT IS NOT INITIALIZED');
        }
        // we don't need to init the db here because it happens in the layout before the project is inited
        init();
        async function init() {
            // if (!idb.db) {
            //     await idb.init();
            // }
            if (container && browser) {
                threeScene.init(container);
                threeScene.animate();
                function updateTextureWithRandomCharacter() {
                    const randomCharacterAsset =
                        allCharacterAssets[Math.floor(Math.random() * allCharacterAssets.length)];
                    threeScene.updateMaterialTexture(`/characters/${randomCharacterAsset}.png`);
                }
                updateTextureWithRandomCharacter();
                // idb.init().then(async () => {
                // await generate.refreshAllGeneratedImgs();

                // THESE INSTANCES ARE WAITING FOR THE PROJECT TO BE INITIALIZED

                // USING WHATEVER TEXTURE IS ACTIVE INSTEAD OF AI OR UPLOAD

                // CAN PROBABLY GET RID OF THIS IN FAVOR FOR THE CACHED KEYS VERSION
                // const lastTexture = true;
                // const lastTexture = await idb.getTexture('last-texture');
                // if (lastTexture) {
                // 	const url = URL.createObjectURL(lastTexture.imgFile);
                // 	threeScene.updateMaterialTexture(url);
                // }
                // 1_00060_.png_1742199625438

                // if (lastTexture) {
                //     if (loadCachedType === 'texture' || loadCachedType === 'ai') {
                //         // const textureId = cachedKeys.getProjectTexture(projects.state.activeProject);
                //         const textureId = project.activeTextureId;
                //         if (!textureId) {
                //             updateTextureWithRandomCharacter();
                //             return;
                //         }

                //         // const textureArrayBuffer = await db.getTexture(textureId);
                //         // if (!textureArrayBuffer) {
                //         // 	updateTextureWithRandomCharacter();
                //         // }
                //         // const blob = new Blob([textureArrayBuffer], { type: 'img/png' });
                //         // const url = URL.createObjectURL(blob);
                //         threeScene.updateMaterialTexture(project.activeTextureUrl);
                //     }

                //     // if (loadCachedType === 'ai') {
                //     // 	const cachedImg = generate.state.cachedImgs[generate.state.cachedImgs.length - 1];
                //     // 	if (cachedImg) {
                //     // 		const url = URL.createObjectURL(cachedImg.imgBlob);
                //     // 		threeScene.updateMaterialTexture(url);
                //     // 	}
                //     // }
                // }
                // });
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
