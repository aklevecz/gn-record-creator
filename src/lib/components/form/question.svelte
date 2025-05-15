<script>
    import customEvents from '$lib/custom-events';
    import details from '$lib/details.svelte';
    import { questions } from '$lib/form-data-model';
    import { onMount } from 'svelte';

    /** @type {{label: string, options: Option[], key: string, required: boolean}}*/
    let { label, options, key, required } = $props();

    /** @type {HTMLElement | null} */
    let questionContainer = $state(null);
    let isInView = $state(false);

    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                isInView = entry.isIntersecting;

                if (isInView) {
                    const color = details.state.record_color.value;
                    const colorHex = questions.record_color.options.find((option) => option.text === color)?.color || '#000000';
                    const changeRecordColorEvent = new CustomEvent(customEvents.changeRecordColorOut, {
                        detail: { color: colorHex }
                    });

                    window.dispatchEvent(changeRecordColorEvent);
                } else {
                    const recordBackInEvent = new CustomEvent(customEvents.recordBackIn);
                    window.dispatchEvent(recordBackInEvent);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.2
            }
        );

        if (questionContainer) {
            observer.observe(questionContainer);
        }

        return () => {
            if (questionContainer) {
                observer.unobserve(questionContainer);
            }
        };
    });

    /** @param {Option} option */
    function handleAnswer(option) {
        // survey.answer(key, option.text);
        details.setValue(key, option.text);

        if (key === 'record_color') {
            const color = option.text;
            const colorHex = questions.record_color.options.find((option) => option.text === color)?.color || '#000000';
            const changeRecordColorEvent = new CustomEvent(customEvents.changeRecordColor, {
                detail: { color: colorHex }
            });

            window.dispatchEvent(changeRecordColorEvent);
        }
    }
</script>

<div class="question-container" bind:this={questionContainer}>
    <div class="label">
        {label}{#if required}*{/if}
    </div>
    <div class="question-buttons-container">
        {#each options as option}
            <!-- {JSON.stringify(survey.state.answers[key] === option.text)} -->
            <button class:isSelected={details.state[key].value === option.text} onclick={() => handleAnswer(option)}>
                {#if option.img}
                    <img src={option.img} alt={option.text} />
                {/if}{option.text.replace('-', ' ')}</button
            >
        {/each}
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    .question-container {
        @apply mt-4 flex flex-col gap-2;
    }
    .label {
        @apply text-lg font-semibold;
    }
    .question-buttons-container {
        @apply flex flex-wrap gap-2;
    }
    button {
        @apply w-[150px] rounded-md text-base font-bold capitalize select-none;
    }
    button.isSelected {
        @apply bg-[var(--accent-color)];
    }
    img {
        @apply mb-1 w-full;
    }
</style>
