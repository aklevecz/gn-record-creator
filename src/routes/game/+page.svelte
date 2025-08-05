<script>
    import Scroller2D from '$lib/components/game/Scroller2D.svelte';

    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
</script>

<svelte:head>
    <title>Mini Game - Good Neighbor Record Creator</title>
    <meta name="description" content="Take a break and play our fun mini-game while we process your vinyl record order. Keep yourself entertained during the wait!" />
    <meta property="og:title" content="Mini Game - Good Neighbor Record Creator" />
    <meta property="og:description" content="Take a break and play our fun mini-game while we process your vinyl record order. Keep yourself entertained during the wait!" />
    <meta property="og:image" content="/characters/carry-blackwhite.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Mini Game - Good Neighbor Record Creator" />
    <meta name="twitter:description" content="Take a break and play our fun mini-game while we process your vinyl record order. Keep yourself entertained during the wait!" />
    <meta name="twitter:image" content="/characters/carry-blackwhite.png" />
</svelte:head>


    <!-- MINI GAME SECTION -->
    <div class="game-section my-10">
        <h2 class="text-xl font-bold mb-4 text-center">Take a break! Play our mini-game while we process your order</h2>
        <Scroller2D />
    </div>
    <!-- END MINI GAME -->