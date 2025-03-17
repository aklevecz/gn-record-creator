<script>
	import { browser } from '$app/environment';
	import { allCharacterAssets, CURRENT_TEXTURE } from '$lib';
	import generate from '$lib/generate.svelte';
	import idb from '$lib/idb';
	import project from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import { cachedKeys } from '$lib/storage';
	import ThreeScene from '$lib/ThreeScene';
	import { onDestroy, onMount } from 'svelte';
	import { texture } from 'three/tsl';

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
			alert("PROJECT IS NOT INITIALIZED")
		}
		if (container && browser) {
			threeScene.init(container);
			threeScene.animate();

			idb.init().then(async () => {
				await generate.refreshAllGeneratedImgs();

				// THESE INSTANCES ARE WAITING FOR THE PROJECT TO BE INITIALIZED

				// USING WHATEVER TEXTURE IS ACTIVE INSTEAD OF AI OR UPLOAD

				// CAN PROBABLY GET RID OF THIS IN FAVOR FOR THE CACHED KEYS VERSION
				const lastTexture = true
				// const lastTexture = await idb.getTexture('last-texture');
				// if (lastTexture) {
				// 	const url = URL.createObjectURL(lastTexture.imgFile);
				// 	threeScene.updateMaterialTexture(url);
				// }
				// 1_00060_.png_1742199625438
				if (lastTexture) {
					console.log('THERE IS NO LAST TEXTURE');
					if (loadCachedType === 'texture' || loadCachedType === 'ai') {
						console.log(projects.state.activeProject)
						const textureId = cachedKeys.getProjectTexture(projects.state.activeProject);
						if (!textureId) {
							console.log('THERE IS NO CURRENT TEXTURE - EVEN IN LOCAL STORAGE');
							return;
						}
						console.log(`texture id: ${textureId}`);
						idb.getTexture(textureId).then((textureFile) => {
							if (!textureFile) {
								console.log('THERE IS NO CURRENT TEXTURE');
								const randomCharacterAsset =
									allCharacterAssets[Math.floor(Math.random() * allCharacterAssets.length)];
								threeScene.updateMaterialTexture(`/characters/${randomCharacterAsset}.png`);
								return;
							}
							// COULD BE ARRAY BUFFER BUT THESE SEEM TO WORK WITH THREEJS NO MATTER WHAT FOR SOME REASON
							const url = URL.createObjectURL(textureFile.imgFile);
							threeScene.updateMaterialTexture(url);
						});
					}

					// if (loadCachedType === 'ai') {
					// 	const cachedImg = generate.state.cachedImgs[generate.state.cachedImgs.length - 1];
					// 	if (cachedImg) {
					// 		const url = URL.createObjectURL(cachedImg.imgBlob);
					// 		threeScene.updateMaterialTexture(url);
					// 	}
					// }
				}
			});
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
