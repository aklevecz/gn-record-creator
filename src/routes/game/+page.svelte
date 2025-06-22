<script>
    import Scroller2D from '$lib/components/game/Scroller2D.svelte';

    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
</script>


    <!-- MINI GAME SECTION -->
    <div class="game-section my-10">
        <h2 class="text-xl font-bold mb-4 text-center">Take a break! Play our mini-game while we process your order</h2>
        <Scroller2D />
    </div>
    <!-- END MINI GAME -->