<script>
    import CarbonSavings from './carbon-savings.svelte';
    import EstimatedPriceCalculator from './estimated-price-calculator.svelte';
</script>

<div class="footer-wrap">
    <div class="footer-panel">
        <CarbonSavings />
        <div class="divider" aria-hidden="true"></div>
        <EstimatedPriceCalculator />
    </div>
</div>

<style>
    .footer-wrap {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 30;
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
        pointer-events: none;
    }
    .footer-panel {
        pointer-events: auto;
        max-width: 960px;
        margin: 0 auto;
        background: var(--gn-ink);
        color: var(--gn-paper);
        border-radius: var(--gn-r-xl);
        box-shadow:
            0 12px 27px rgba(0, 0, 0, 0.2),
            0 49px 49px rgba(0, 0, 0, 0.17);
        padding: 14px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        font-family: var(--gn-font-sans);
    }
    .divider {
        width: 1px;
        align-self: stretch;
        background: rgba(244, 244, 244, 0.12);
    }
    @media (max-width: 540px) {
        .footer-panel {
            padding: 12px 16px;
            gap: 12px;
            border-radius: 22px;
        }
    }
</style>
