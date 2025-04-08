<script>
    import project from '$lib/project.svelte';
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    const savings = $derived(project.state.carbonSavings.estimatedCarbonSavings);

    const domain = [0, 5];
    const range = [0, 14];

    // Main stem growth tween
    const tween = new Tween(0, {
        duration: 400,
        easing: cubicOut
    });

    // Leaf growth tweens
    const leftLeafTween = new Tween(0, {
        duration: 300,
        easing: cubicOut
    });

    const rightLeafTween = new Tween(0, {
        duration: 300,
        easing: cubicOut
    });

    // Flower growth tween
    const flowerTween = new Tween(0, {
        duration: 300,
        easing: cubicOut
    });

    $effect(() => {
        const normalizedValue = (savings - domain[0]) / (domain[1] - domain[0]);
        const scaledValue = range[0] + normalizedValue * (range[1] - range[0]);
        tween.target = scaledValue;

        // Start growing leaves when stem is halfway
        if (normalizedValue > 0.5) {
            const leafSize = Math.min(4, savings - 2);
            leftLeafTween.target = leafSize;
            rightLeafTween.target = leafSize;
        } else {
            leftLeafTween.target = 0;
            rightLeafTween.target = 0;
        }

        // Start growing flower when almost complete
        if (normalizedValue > 0.7) {
            const flowerSize = Math.min(3, (savings - 3.5) * 2);
            flowerTween.target = flowerSize;
        } else {
            flowerTween.target = 0;
        }
    });

    // Format the savings for display
    const formattedSavings = $derived(savings ? savings.toFixed(2) : '0.00');
</script>

<div
    class="fixed bottom-0 left-0 flex h-10 w-full items-center justify-center bg-[var(--purple)] text-center text-xl text-[var(--gn-green)]"
>
    <span class="font-semibold"
        >Carbon Savings
        {formattedSavings}</span
    >
    <div class="relative w-[100px]">
        <svg
            class="absolute bottom-[-20px] overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <!-- Soil -->
            <rect x="8" y="20" width="8" height="2" fill="#8B4513" rx="1" />

            <!-- Vertical stem with animated height -->
            <line
                x1="12"
                y1="20"
                x2="12"
                y2={20 - tween.current}
                stroke="#4CAF50"
                stroke-width="1.5"
            ></line>

            <!-- Left leaf -->
            {#if leftLeafTween.current > 0}
                <path
                    d="M12,{20 - tween.current * 0.6} C10,{18 - tween.current * 0.6} 8,{19 -
                        tween.current * 0.6} 9,{16 - tween.current * 0.6}"
                    stroke="#66BB6A"
                    stroke-width="1"
                    fill="#81C784"
                    style="transform-origin: 12px {20 -
                        tween.current * 0.6}px; transform: scale({leftLeafTween.current / 4});"
                ></path>
            {/if}

            <!-- Right leaf -->
            {#if rightLeafTween.current > 0}
                <path
                    d="M12,{20 - tween.current * 0.4} C14,{18 - tween.current * 0.4} 16,{19 -
                        tween.current * 0.4} 15,{16 - tween.current * 0.4}"
                    stroke="#66BB6A"
                    stroke-width="1"
                    fill="#81C784"
                    style="transform-origin: 12px {20 -
                        tween.current * 0.4}px; transform: scale({rightLeafTween.current / 4});"
                ></path>
            {/if}

            <!-- Flower at the top -->
            {#if flowerTween.current > 0}
                <!-- Flower center -->
                <circle cx="12" cy={20 - tween.current} r={flowerTween.current} fill="#FFC107"
                ></circle>

                <!-- Petals -->
                {#if flowerTween.current > 1}
                    <circle
                        cx={12 - flowerTween.current}
                        cy={20 - tween.current}
                        r={flowerTween.current * 0.7}
                        fill="#FF5722"
                        style="opacity: {Math.min(1, (flowerTween.current - 1) * 2)};"
                    ></circle>
                    <circle
                        cx={12 + flowerTween.current}
                        cy={20 - tween.current}
                        r={flowerTween.current * 0.7}
                        fill="#FF5722"
                        style="opacity: {Math.min(1, (flowerTween.current - 1) * 2)};"
                    ></circle>
                    <circle
                        cx="12"
                        cy={20 - tween.current - flowerTween.current}
                        r={flowerTween.current * 0.7}
                        fill="#FF5722"
                        style="opacity: {Math.min(1, (flowerTween.current - 1) * 2)};"
                    ></circle>
                    <circle
                        cx="12"
                        cy={20 - tween.current + flowerTween.current}
                        r={flowerTween.current * 0.7}
                        fill="#FF5722"
                        style="opacity: {Math.min(1, (flowerTween.current - 1) * 2)};"
                    ></circle>
                {/if}
            {/if}
        </svg>
    </div>
</div>
