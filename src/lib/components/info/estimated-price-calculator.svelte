<script>
    import project from '$lib/project.svelte';

    const cost = $derived(project.state.pricing?.estimatedCost ?? 0);
    const formatted = $derived(
        cost.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        })
    );
</script>

<div class="cost">
    <span class="label">Estimated Cost</span>
    <span class="value">{formatted}</span>
</div>

<style>
    .cost {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
        font-family: var(--gn-font-sans);
        line-height: 1.1;
    }
    .label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--gn-fg-on-ink-2);
    }
    .value {
        font-family: var(--gn-font-display);
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1;
        color: var(--gn-paper);
    }
    @media (max-width: 540px) {
        .value {
            font-size: 22px;
        }
        .label {
            font-size: 9px;
        }
    }
</style>
