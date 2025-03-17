<script>
	import { browser } from '$app/environment';
	import ButtonsContainer from '$lib/components/designer/buttons-container.svelte';
	import RecordDesigner from '$lib/components/designer/record-designer.svelte';
	import generate from '$lib/generate.svelte';
	import projects from '$lib/projects.svelte';
	import three from '$lib/three';
	import ThreeScene from '$lib/ThreeScene';
	import { onDestroy, onMount } from 'svelte';
	import { Spring } from 'svelte/motion';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let threeScene = new ThreeScene();

	let isMinimized = $state(true);

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

	const offScreenSpring = -100;
	const spring = new Spring(offScreenSpring, {
		damping: 1.2,
		stiffness: 0.1
	});
	$effect(() => {
		if (generate.state.status === 'succeeded') {
			spring.set(10);

			setTimeout(() => {
				spring.set(offScreenSpring);
				generate.setStatus('idle');
			}, 3000);
		}
	});

	let trippingOut = $state(false);
</script>

<div class="h-[80vh] md:flex md:h-auto">
	<button class:trippingOut={trippingOut} class="absolute right-2 top-14 text-xs" onclick={() => {
		trippingOut = !trippingOut
		threeScene.toggleDisplacementShader()
	}}>TRIP OUT</button>
	{#if projects.state.initialized}<div
			class="three-wrapper md:sticky md:top-0"
			class:minimized={isMinimized}
		>
			<RecordDesigner {threeScene} loadCachedType="ai" />
		</div>{/if}
	<ButtonsContainer {threeScene} bind:isMinimized />
	<div style="left:{spring.current}%;" class="cute-feedback absolute bottom-50 h-[258px] w-[200px]">
		<div class="h-ful relative w-full">
			<div class="absolute top-0 right-0 rounded-lg bg-white p-4 text-black">Sick!</div>
			<img class="h-full w-full" src="/characters/spin-color.svg" alt="spin" />
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";
	.three-wrapper {
		@apply h-[65%] md:h-[90vh] md:w-[50vw] md:flex-[1_0_50%];
	}
	.three-wrapper.minimized {
		@apply h-[93%] md:h-[90vh] md:w-[90vw];
	}
	button.trippingOut {
		animation: hueShift 2s infinite linear;
		@apply bg-red-400 text-green-400;
	}

	@keyframes hueShift {
		0% {
			filter: hue-rotate(0deg);
		}
		100% {
			filter: hue-rotate(360deg);
		}
	}
</style>
