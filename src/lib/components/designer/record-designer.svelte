<script>
	import Upload from '../form/upload.svelte';

	import { browser } from '$app/environment';
	import idb from '$lib/idb';
	import ThreeScene from '$lib/three';
	import { onMount } from 'svelte';

	/** @type {ThreeScene | null}*/
	let threeModel = $state(null);
	/** @type {null | HTMLElement}*/
	let container = $state(null);
	onMount(async () => {
		if (container && browser) {
			idb.init().then(() => {
				if (container) {
					threeModel = new ThreeScene(container);
					threeModel.animate();
				} else {
					console.error('No container found');
				}
			});
		}
	});
</script>

<div bind:this={container} class="three-container"></div>
<Upload {threeModel} />

<style>
	.three-container {
		width: 345px;
		height: 345px;
		aspect-ratio: square;
		/* border: 2px solid white; */
		margin: 0 auto;
	}
</style>
