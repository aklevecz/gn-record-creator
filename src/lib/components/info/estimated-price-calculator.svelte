<script>
    import project from '$lib/project.svelte';
</script>

<div class="text-center text-xl">
    <span class="font-semibold">Estimated Cost:</span>
    {project.state.pricing.estimatedCost.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    })}
</div>
