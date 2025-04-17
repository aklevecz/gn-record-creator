<script>
    import { Chart, registerables } from 'chart.js';
    import { onMount } from 'svelte';
    Chart.register(...registerables);

    /** @type {{data:import('./$types').PageData}} */
    let { data } = $props();
    /** @type {Chart<"bar", number[], string> | null} */
    let chart = null;

    // Add this line to debug data on component initialization
    console.log('Initial data:', data);

    onMount(() => {
        // Add delay to ensure DOM is fully loaded
        setTimeout(() => {
            console.log('onMount data:', data);

            if (!data || !data.board || !data.itemUnits || !Array.isArray(data.itemUnits)) {
                console.error('Missing or invalid data:', data);
                return;
            }

            /** @type {*} chartEl */
            const chartEl = document.getElementById('myChart');
            if (!chartEl) {
                console.error('Canvas element not found');
                return;
            }

            const ctx = chartEl.getContext('2d');
            if (!ctx) {
                console.error('Could not get 2D context');
                return;
            }

            console.log('Creating chart with data:', {
                labels: data.board.items_page.items.map((/** @type {*} */ item) => item.name),
                values: data.itemUnits
            });

            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.board.items_page.items.map((/** @type {*} */ item) => item.name),
                    datasets: [
                        {
                            label: 'Total Units',
                            data: data.itemUnits,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }, 100); // Small delay to ensure DOM is ready
    });
</script>

{#if data?.board}
    <h1>{data.board.name}</h1>
    <div class="chart-container">
        <canvas id="myChart"></canvas>
    </div>
{:else}
    <p>Loading...</p>
{/if}

<style>
    .chart-container {
        position: relative;
        height: 400px;
        width: 100%;
    }
</style>
