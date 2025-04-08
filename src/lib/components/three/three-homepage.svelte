<script>
    import { onMount } from 'svelte';

    // import ThreeScene from '$lib/ThreeScene';
    import RecordDesigner from '../designer/record-designer.svelte';
    import Upload from '../form/upload.svelte';
    import project from '$lib/project.svelte';
    import CarbonSavings from '../info/carbon-savings.svelte';

    // let threeScene = new ThreeScene();
    /** @type {import('$lib/ThreeScene').default | null}*/
    let threeScene = $state(null);

    onMount(async () => {
        const ThreeSceneModule = await import('$lib/ThreeScene.js');
        threeScene = new ThreeSceneModule.default();
        // Initialize your scene here
    });
</script>

<div class=" md:fixed md:top-12 md:right-0">
    <h2 class="mt-12 text-center text-2xl font-bold">Cover Creator</h2>
    <div class="mx-auto block h-[90vw] w-[90vw] md:h-[65vh] md:w-[60vw]">
        {#if threeScene}<RecordDesigner {threeScene} />{/if}
        {#if !threeScene}<div>Loading...</div>{/if}
    </div>

    <!-- SAVINGS COULD BE SOMEWHERE ELSE -->
    <!-- DOESNT REALLY NEED TO BE RIGHT ABOVE THE UPLOAD BUTTON -->
    <div class="text-center text-xl">
        <span class="font-semibold">Estimated Cost:</span>
        {project.state.pricing.estimatedCost.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        })}
    </div>
    <CarbonSavings />
    <!-- SAVINGS COULD BE SOMEWHERE ELSE  -->

    <Upload />
</div>
