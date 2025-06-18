<script>
    import { onMount } from 'svelte';
    import RecordDesigner from '../designer/record-designer.svelte';
    import Upload from '../form/upload.svelte';
    import { browser } from '$app/environment';

    /** @type {import('$lib/ThreeScene').default | null}*/
    let threeScene = $state(null);

    let dims = $state({ width: '100%', height: '100%' });

    onMount(async () => {
        const ThreeSceneModule = await import('$lib/ThreeScene.js');
        threeScene = new ThreeSceneModule.default();

        // Patch upload button being covered on mobile
        if (browser) {
            if (window.innerWidth < 768) {
                dims.width = '290px';
                dims.height = '290px';
            }
        }
    });
</script>

<div class="three-homepage md:fixed md:top-12 md:right-0">
    <h2 class="mt-12 text-center text-2xl font-bold">Cover Creator</h2>
    <div class="mx-auto block h-[90vw] w-[90vw] md:h-[65vh] md:w-[60vw]">
        {#if threeScene}<RecordDesigner {threeScene} width={dims.width} height={dims.height} />{/if}
        {#if !threeScene}<div>Loading...</div>{/if}
    </div>
    <div class="pointer-events-auto">
        <Upload />
    </div>
</div>

<style lang="postcss">
    .three-homepage {
        @apply pointer-events-none;
    }
</style>
