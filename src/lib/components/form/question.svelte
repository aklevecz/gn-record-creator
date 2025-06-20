<script>
    import customEvents from '$lib/custom-events';
    import details from '$lib/details.svelte';
    import { formFields } from '$lib/monday/formFields';
    import { onMount } from 'svelte';

    /** @type {{label: string, options: FormFieldOption[], key: string, required: boolean, maxSelections?: number}}*/
    let { label, options, key, required, maxSelections = 1 } = $props();

    /** @type {HTMLElement | null} */
    let questionContainer = $state(null);
    let isInView = $state(false);

    const ANIMATION_DURATION = 2000;
    let isAnimating = false;
    const KEY = 'record_color';

    /** @param {boolean} isInView */
    function runAnimation(isInView) {
        if (isInView) {
            // This doesn't change isAnimate properly
            isAnimating = true;
            const color = details.state.record_color.value[details.state.record_color.value.length - 1];
            const colorHex = formFields.record_color?.options?.find((option) => option.text === color)?.color || '#000000';
            const changeRecordColorEvent = new CustomEvent(customEvents.changeRecordColorOut, {
                detail: { color: colorHex }
            });

            window.dispatchEvent(changeRecordColorEvent);
            setTimeout(() => {
                isAnimating = false;
            }, ANIMATION_DURATION);
        } else {
            isAnimating = true;
            const recordBackInEvent = new CustomEvent(customEvents.recordBackIn);
            window.dispatchEvent(recordBackInEvent);

            setTimeout(() => {
                isAnimating = false;
            }, ANIMATION_DURATION);
        }
    }
    let loaded = false;
    onMount(() => {
        if (key !== KEY) return;
        setTimeout(() => {
            loaded = true;
        }, 1000);
        const observer = new IntersectionObserver(
            (entries) => {
                const delay = !loaded ? 4000 : 0;
                // if (isAnimating) return;
                const entry = entries[0];
                isInView = entry.isIntersecting;
                console.log(`is in view ${isInView}`);
                setTimeout(() => {
                    runAnimation(isInView);
                }, delay);
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
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

    /** @param {FormFieldOption} option */
    function handleAnswer(option) {
        // survey.answer(key, option.text);
        // Migration to using array -- slight extreme hack
        const value = details.state[key].value;
        const isString = typeof value === 'string';
        let selections = isString ? [] : typeof value === 'object' ? value : value;

        let changeColor = true;

        if (selections.includes(option.text)) {
            selections = selections.filter((selection) => selection !== option.text);
            changeColor = false;
        } else {
            if (selections.length >= maxSelections) {
                selections = selections.slice(1, selections.length).flat();
                selections.push(option.text);
            } else {
                selections.push(option.text);
            }
        }
        // details.setValue(key, option.text);
        // Selection could be passed to setValue and then it understands type
        // But then there is some trickiness with initalizing it still
        // details.setValue( key, selections.join(DELIMITER));
        // COULD TRY THIS
        details.setValue(key, selections);
        if (key === KEY && changeColor) {
            const color = option.text;
            const colorHex = formFields.record_color?.options?.find((option) => option.text === color)?.color || '#000000';
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
            <!-- class:isSelected={selections.includes(option.text)} -->
            <button class:isSelected={details.state[key].value.includes(option.text)} onclick={() => handleAnswer(option)}>
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
        @apply mt-4 flex flex-col gap-2 md:max-w-[46vw];
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
