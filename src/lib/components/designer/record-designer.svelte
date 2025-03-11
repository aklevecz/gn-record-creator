<script>
	import { browser } from '$app/environment';
	import { CURRENT_TEXTURE } from '$lib';
	import generate from '$lib/generate.svelte';
	import idb from '$lib/idb';
	import projects from '$lib/projects.svelte';
	import ThreeScene from '$lib/three';
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
		if (container && browser) {
			idb.init().then(async () => {
				await generate.refreshAllGeneratedImgs();
				if (container) {
					threeScene.init(container);
					threeScene.animate();
					if (loadCachedType === 'texture') {
						idb.getTexture(`${projects.state.activeProject}-${CURRENT_TEXTURE}`).then((textureFile) => {
							if (!textureFile) {
								console.log('THERE IS NO CURRENT TEXTURE');
								return;
							}
							const url = URL.createObjectURL(textureFile.imgFile);
							threeScene.updateMaterialTexture(url);
						});
					}

					if (loadCachedType === 'ai') {
						const cachedImg = generate.state.cachedImgs[generate.state.cachedImgs.length - 1];
						if (cachedImg) {
							const url = URL.createObjectURL(cachedImg.imgBlob);
							threeScene.updateMaterialTexture(url);
						}
					}

				} else {
					console.error('No container found');
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
