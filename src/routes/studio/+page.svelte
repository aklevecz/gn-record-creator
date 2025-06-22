<script>
    import { browser } from '$app/environment';
    import DreamControls from '$lib/components/designer/dream-controls.svelte';
    import RecordDesigner from '$lib/components/designer/record-designer.svelte';
    import Groovy from '$lib/components/toasts/groovy.svelte';
    import generate from '$lib/generate.svelte';
    import project from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import ThreeScene from '$lib/ThreeScene';
    import { onDestroy, onMount } from 'svelte';
    import { Spring } from 'svelte/motion';

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

    $effect(() => {
        if (projects.initialized) {
            generate.refreshAllGeneratedImgs();
        }
    });

    onMount(() => {
        // setTimeout(() => {
        //     // is there a reason not to do this? maybe there was a generate.init before?
        //     generate.refreshAllGeneratedImgs();
        // },1000);
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

<div class="studio-container">
    <!-- TRIP OUT BUTTON -->
    {#if !generate.state.generating}<button
            class:trippingOut
            class="absolute top-14 right-2 z-20 text-xs"
            onclick={() => {
                trippingOut = !trippingOut;
                threeScene.toggleDisplacementShader();
            }}>TRIP OUT</button
        >{/if}
    <!-- END TRIP OUT BUTTON -->

    <!-- RECORD MODEL -->
    {#if projects.initialized}<div class="three-wrapper" class:minimized={isMinimized}>
            <RecordDesigner {threeScene} />
        </div>{/if}
    <!-- END RECORD MODEL  -->

    <!-- CONTROLS -->
    <DreamControls {threeScene} bind:isMinimized />
    <!-- END CONTROLS -->

    <!-- GROOVY FEEDBACK -->
    <Groovy text="Sick!!" bottomPercent={spring.current} />
    <!-- GROOVY FEEDBACK -->
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    .studio-container {
        @apply h-[80vh] md:flex md:h-auto;
    }
    .three-wrapper {
        @apply h-[65%] md:sticky md:top-0 md:h-[90vh] md:w-[50vw] md:flex-[1_0_50%];
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
