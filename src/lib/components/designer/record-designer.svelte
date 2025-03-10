<script>
	import { browser } from '$app/environment';
	import generate from '$lib/generate.svelte';
	import idb from '$lib/idb';
	import ThreeScene from '$lib/three';
	import { onDestroy, onMount } from 'svelte';

	let { width = '100%', height = '100%', threeScene = new ThreeScene() } = $props();

	/** @type {null | HTMLElement}*/
	let container = $state(null);
	onMount(async () => {
		if (container && browser) {
			idb.init().then(async () => {
				 await generate.refreshAllGeneratedImgs();
				if (container) {
					threeScene.init(container);
					threeScene.animate();
					const cachedImg = generate.state.cachedImgs[generate.state.cachedImgs.length - 1];
					if (cachedImg) {
						const url = URL.createObjectURL(cachedImg.imgBlob);
						threeScene.updateMaterialTexture(url);
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
