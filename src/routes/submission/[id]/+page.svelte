<script>
    import { recordColors } from '$lib/monday/formFields';
    import { onMount } from 'svelte';

    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
    /** @type {Submission | null} */
    let submission = data.submission;

    let showExplosion = $state(false);

    /** @typedef {Object} ExplosionRecord
     * @property {string} value
     * @property {string} text
     * @property {string} color
     * @property {string} img
     * @property {string} id
     * @property {number} x
     * @property {number} y
     * @property {number} rotation
     * @property {number} scale
     * @property {number} delay
     */

    /** @type {ExplosionRecord[]} */
    let explosionRecords = [];

    onMount(() => {
        const hasCelebrated = localStorage.getItem('hasCelebrated' + data.submission.id);
        if (!hasCelebrated) {
            const records = [
                { value: recordColors.purpleHaze, text: recordColors.purpleHaze, color: '#913574', img: 'records/purple-haze.png' },
                { value: recordColors.cosmicBlack, text: recordColors.cosmicBlack, color: '#030303', img: 'records/cosmic-black.png' },
                { value: recordColors.oceanFloor, text: recordColors.oceanFloor, color: '#003479', img: 'records/ocean-floor.png' },
                { value: recordColors.skyBlue, text: recordColors.skyBlue, color: '#0072b0', img: 'records/sky-blue.png' },
                { value: recordColors.salsaVerde, text: recordColors.salsaVerde, color: '#398930', img: 'records/salsa-verde.png' },
                { value: recordColors.limoncello, text: recordColors.limoncello, color: '#ded028', img: 'records/limoncello.png' },
                { value: recordColors.habanero, text: recordColors.habanero, color: '#ff5214', img: 'records/habanero.png' },
                { value: recordColors.redAlert, text: recordColors.redAlert, color: '#dd2a1e', img: 'records/red-alert.png' },
                { value: recordColors.hibiscus, text: recordColors.hibiscus, color: '#d30273', img: 'records/hibiscus.png' },
                { value: recordColors.lightning, text: recordColors.lightning, color: '#e2e2e2', img: 'records/lightning.png' },
                { value: recordColors.glassyIce, text: recordColors.glassyIce, color: '#7e7e7e', img: 'records/glassy-ice.png' }
            ];
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            explosionRecords = [...records, ...records, ...records].map((record, index) => ({
                ...record,
                id: `record-${index}`,
                x: (Math.random() - 0.5) * windowWidth * 1.2,
                y: Math.random() * windowHeight * 0.8 + windowHeight * 0.2,
                rotation: Math.random() * 720 - 360,
                scale: 0.5 + Math.random() * 0.8,
                delay: Math.random() * 800
            }));

            setTimeout(() => {
                showExplosion = true;
                setTimeout(() => {
                    // showExplosion = false;
                }, 4000);
            }, 500);

            // localStorage.setItem('hasCelebrated' + data.submission.id, "true");
        }
    });
</script>

{#if !submission}
    <div class="not-found">
        <div class="not-found-content">
            <h1>Submission Not Found</h1>
            <p>The submission you're looking for doesn't exist or may have been removed.</p>
            <a href="/" class="home-link">← Return Home</a>
        </div>
    </div>
{/if}
{#if showExplosion}
    <div class="explosion-container">
        <div class="woohoo-text">
            Woohoo!
            <img alt="Hifive" class="m-auto" src="/characters/hifive-blackwhite.svg" />
        </div>
        {#each explosionRecords as record (record.id)}
            <div
                class="exploding-record"
                style="
                    --x: {record.x}px;
                    --y: {record.y}px;
                    --rotation: {record.rotation}deg;
                    --scale: {record.scale};
                    --delay: {record.delay}ms;
                "
            >
                <img src="/{record.img}" alt={record.text} />
            </div>
        {/each}
    </div>
{/if}

{#if submission}
    <div class="page-container">
        <div class="submission-page-header">
            <div class="header-content">
                <div class="success-message">
                    <h1>Thank You!</h1>
                    <p>You'll hear from your good neighbor soon!</p>
                </div>
                <div class="character-image">
                    <img src="/characters/infatuation-color.svg" class="" alt="Infatuation" />
                </div>
            </div>
        </div>

        <div class="submission-container">
            <div class="submission-header">
                <div class="header-info">
                    <h2>Submission Details</h2>
                    <div class="submission-id">ID: <span class="id-value">{submission.id}</span></div>
                </div>
                <div class="submission-image">
                    <img src={`/api/upload/${submission.id}`} alt="Submission" />
                </div>
            </div>

            {#snippet submissionField(/** @type {*} */ props)}
                <div class="field">
                    <div class="label">{props.label}:</div>
                    <div class="value" id={props.label}>{props.value || 'Not specified'}</div>
                </div>
            {/snippet}

            <div class="sections-grid">
                <div class="submission-section">
                    <h3>Project Information</h3>
                    <div class="section-content">
                        {@render submissionField({ label: 'Title', value: submission.title })}
                        {@render submissionField({ label: 'Artist Name', value: submission.artist })}
                        {@render submissionField({ label: 'Label', value: submission.label })}
                        {@render submissionField({ label: 'Catalog Number', value: submission.catalog_number })}
                    </div>
                </div>

                <!-- <div class="submission-section">
                    <h3>Contact Information</h3>
                    <div class="section-content">
                        {@render submissionField({
                            label: 'Contact Name',
                            value: submission.contact_first_name + ' ' + submission.contact_last_name
                        })}
                        {@render submissionField({ label: 'Contact Email', value: submission.contact_email })}
                        {@render submissionField({ label: 'Phone', value: submission.phone })}
                    </div>
                </div> -->

                <div class="submission-section">
                    <h3>Release Details</h3>
                    <div class="section-content">
                        {@render submissionField({ label: 'Release Date', value: submission.release_date })}
                        {@render submissionField({ label: 'Depot Date', value: submission.depot_date })}
                    </div>
                </div>

                <div class="submission-section">
                    <h3>Shipping Information</h3>
                    <div class="section-content">
                        {@render submissionField({ label: 'Shipping Address', value: submission.shipping_address })}
                        {@render submissionField({
                            label: 'Shipping Logistics',
                            value: submission.shipping_logistics
                        })}
                    </div>
                </div>

                <div class="submission-section full-width">
                    <h3>Product Specifications</h3>
                    <div class="section-content specs-grid">
                        {@render submissionField({ label: 'Total Units', value: submission.total_units })}
                        {@render submissionField({ label: 'Records Per Set', value: submission.records_per_set })}
                        {@render submissionField({ label: 'Record Format', value: submission.record_format })}
                        {@render submissionField({ label: 'Record Color', value: submission.record_color })}
                        {@render submissionField({ label: 'Lacquers', value: submission.lacquers })}
                        {@render submissionField({ label: 'Metalwork', value: submission.metalwork })}
                        {@render submissionField({ label: 'Test Prints', value: submission.test_prints })}
                        {@render submissionField({ label: 'Packaging', value: submission.packaging })}
                    </div>
                </div>

                <div class="submission-section full-width">
                    <h3>Additional Notes</h3>
                    <div class="section-content">
                        <div class="notes-field">
                            <div class="notes-content">{submission.notes || 'No additional notes provided'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style lang="postcss">
    @reference "tailwindcss/theme";

    .page-container {
        @apply min-h-screen bg-gray-50;
    }

    .not-found {
        @apply flex min-h-screen items-center justify-center bg-gray-50;
    }

    .not-found-content {
        @apply mx-4 max-w-md rounded-lg bg-white p-8 text-center shadow-md;
    }

    .not-found-content h1 {
        @apply mb-4 text-2xl font-bold text-gray-800;
    }

    .not-found-content p {
        @apply mb-6 text-gray-600;
    }

    .home-link {
        @apply inline-block rounded-md bg-blue-600 px-4 py-2 text-white no-underline transition-colors hover:bg-blue-700;
    }

    .submission-page-header {
        @apply border-b border-gray-200 bg-white py-8;
    }

    .header-content {
        @apply mx-auto flex max-w-4xl items-center justify-between px-6;
    }

    .success-message h1 {
        @apply mb-2 text-3xl font-bold text-green-600;
    }

    .success-message p {
        @apply text-lg text-gray-600;
    }

    .character-image img {
        @apply h-16 w-16;
    }

    .submission-container {
        @apply mx-auto max-w-4xl px-6 py-8;
    }

    .submission-header {
        @apply mb-8 flex items-start justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm;
    }

    .header-info h2 {
        @apply mb-2 text-2xl font-bold text-gray-800;
    }

    .submission-id {
        @apply text-sm text-gray-600;
    }

    .id-value {
        @apply font-mono font-semibold text-gray-800;
    }

    .submission-image {
        @apply ml-6 flex-shrink-0;
    }

    .submission-image img {
        @apply h-32 w-32 rounded-lg border border-gray-200 object-cover;
    }

    .sections-grid {
        @apply grid grid-cols-1 gap-6 md:grid-cols-2;
    }

    .submission-section {
        @apply rounded-lg border border-gray-200 bg-white p-6 shadow-sm;
    }

    .submission-section.full-width {
        @apply md:col-span-2;
    }

    .submission-section h3 {
        @apply mb-4 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-800;
    }

    .section-content {
        @apply space-y-3;
    }

    .specs-grid {
        @apply grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2;
    }

    .field {
        @apply flex flex-col sm:flex-row sm:items-center;
    }

    .field .label {
        @apply mb-1 text-sm font-medium text-gray-600 sm:mb-0 sm:w-32 sm:flex-shrink-0;
    }

    .field .value {
        @apply text-sm font-medium break-words text-gray-800;
    }

    .notes-field {
        @apply rounded-md bg-gray-50 p-4;
    }

    .notes-content {
        @apply text-sm leading-relaxed whitespace-pre-wrap text-gray-800;
    }

    .explosion-container {
        @apply pointer-events-none fixed inset-0 z-50 overflow-hidden;
    }

    .woohoo-text {
        @apply absolute top-1/4 left-1/2;
        transform: translate(-50%, -50%) scale(0);
        font-size: 4rem;
        font-weight: bold;
        color: var(--purple);
        text-shadow:
            3px 3px 0px #fff,
            -3px -3px 0px #fff,
            3px -3px 0px #fff,
            -3px 3px 0px #fff,
            6px 6px 12px rgba(0, 0, 0, 0.3);
        animation: woohoo 3s ease-out forwards;
        font-family: 'Comic Sans MS', cursive, sans-serif;
    }

    .exploding-record {
        @apply absolute;
        left: 50%;
        top: 10%;
        width: 80px;
        height: 80px;
        transform: translate(-50%, -50%) scale(0) rotate(0deg);
        animation: explode 4s ease-out forwards;
        animation-delay: var(--delay);
    }

    .exploding-record img {
        @apply h-full w-full rounded-full object-cover;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }

    @keyframes woohoo {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(-10deg);
            opacity: 0;
        }
        20% {
            transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
            opacity: 1;
        }
        40% {
            transform: translate(-50%, -50%) scale(0.9) rotate(-2deg);
            opacity: 1;
        }
        60% {
            transform: translate(-50%, -50%) scale(1.1) rotate(1deg);
            opacity: 1;
        }
        80% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0.8) rotate(0deg);
            opacity: 0;
        }
    }

    @keyframes explode {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
        }
        15% {
            transform: translate(-50%, -50%) scale(var(--scale)) rotate(calc(var(--rotation) * 0.2));
            opacity: 1;
        }
        60% {
            transform: translate(var(--x), var(--y)) scale(var(--scale)) rotate(calc(var(--rotation) * 0.8));
            opacity: 1;
        }
        100% {
            transform: translate(var(--x), calc(var(--y) + 200px)) scale(calc(var(--scale) * 0.6)) rotate(var(--rotation));
            opacity: 0;
        }
    }

    @media (max-width: 640px) {
        .header-content {
            @apply flex-col gap-4 text-center;
        }

        .submission-header {
            @apply flex-col items-center text-center;
        }

        .submission-image {
            @apply mt-4 ml-0;
        }

        .sections-grid {
            @apply grid-cols-1;
        }

        .submission-section.full-width {
            @apply col-span-1;
        }

        .specs-grid {
            @apply grid-cols-1;
        }

        .exploding-record {
            width: 60px;
            height: 60px;
        }

        .woohoo-text {
            font-size: 2.5rem;
        }
    }
</style>
