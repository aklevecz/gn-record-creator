<script>
	import { browser } from '$app/environment';
	import ButtonsContainer from '$lib/components/designer/buttons-container.svelte';
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import generate from '$lib/generate.svelte';
	import ThreeScene from '$lib/three';
	import { onDestroy, onMount } from 'svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let threeScene = new ThreeScene();

	let isMinimized = $state(false);

	function resizeThree() {
		threeScene.resize();
	}

	$effect(() => {
		isMinimized;
		resizeThree();
	});

	onMount(() => {
		if (browser) window.addEventListener('resize', resizeThree);
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('resize', resizeThree);
	});

	$effect(() => {
		if (generate.state.status === 'succeeded') {
			setTimeout(() => {
				generate.setStatus('idle');
			}, 1000);
		}
	});
</script>

<div class="h-[80vh] md:h-auto md:flex">
	<div class="three-wrapper md:sticky md:top-0" class:minimized={isMinimized}>
		<RecordDesigner {threeScene} loadCachedType="ai" />
	</div>
	<ButtonsContainer {threeScene} bind:isMinimized />
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";
	.three-wrapper {
		@apply h-[65%] md:h-[90vh] md:w-[50vw] md:flex-[1_0_50%];
	}
	.three-wrapper.minimized {
		@apply h-[93%] md:h-[90vh] md:w-[90vw];
	}
</style>
