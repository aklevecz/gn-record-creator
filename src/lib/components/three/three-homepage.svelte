<script>
	import threeScenes from '$lib/three.svelte';
	import ThreeScene from '$lib/ThreeScene';
	import RecordDesigner from '../designer/record-designer.svelte';
	import Upload from '../form/upload.svelte';

	
	let threeScene = new ThreeScene();
	threeScenes['form'] = threeScene;
</script>

<div class=" md:fixed md:top-12 md:right-0">
    <h2 class="mt-12 text-center text-2xl font-bold">Cover Creator</h2>
    <div class="mx-auto block h-[90vw] w-[90vw] md:h-[65vh] md:w-[60vw]">
        <RecordDesigner {threeScene} />
    </div>
    <Upload {threeScene} />
</div>