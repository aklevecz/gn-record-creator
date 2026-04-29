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
                {/if}<span class="opt-label">{option.text.replace('-', ' ')}</span></button
            >
        {/each}
    </div>
</div>

<style>
    .question-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .label {
        font-family: var(--gn-font-sans);
        font-weight: 700;
        font-size: 18px;
        letter-spacing: -0.024em;
        color: var(--gn-ink);
    }
    .question-buttons-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    /* Image-swatch questions: align rows to the left on desktop,
       give rows extra vertical breathing room. Mobile overrides
       below switch this to a 2-column grid. */
    .question-buttons-container:has(img) {
        justify-content: flex-start;
        row-gap: 18px;
    }
    button {
        background: var(--gn-paper);
        color: var(--gn-ink);
        box-shadow: inset 0 0 0 1px var(--gn-ink);
        font-weight: 700;
        font-size: 14px;
        text-transform: capitalize;
        padding: 10px 18px;
        border-radius: var(--gn-r-full);
        user-select: none;
        min-width: 140px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }
    button:hover:not(:disabled) {
        background: var(--gn-n-100);
    }
    button.isSelected {
        background: var(--gn-ink);
        color: var(--gn-paper);
        box-shadow: none;
    }
    button.isSelected:hover {
        background: #000;
    }
    /* Image swatches: drop the ring + chip styling so the vinyl reads on its own.
       Fix the width so every swatch occupies the same footprint regardless of
       label length — keeps images aligned across rows on mobile. */
    button:has(img) {
        background: transparent;
        box-shadow: none;
        padding: 6px;
        border-radius: var(--gn-r-sm);
        min-width: 0;
        width: 122px;
    }
    button:has(img):hover:not(:disabled) {
        background: var(--gn-n-100);
    }
    button.isSelected:has(img) {
        background: var(--gn-n-150);
        color: var(--gn-ink);
        box-shadow: inset 0 0 0 2px var(--gn-ink);
    }
    img {
        width: 110px;
        height: 110px;
        display: block;
        border-radius: var(--gn-r-sm);
        object-fit: contain;
    }
    /* Constrain swatch labels to the button width so long names
       like "Ocean Floor (Dark Blue)" wrap below the disc instead
       of overflowing into the neighbouring swatch. */
    button:has(img) .opt-label {
        display: block;
        width: 100%;
        font-size: 13px;
        line-height: 1.2;
        text-align: center;
        overflow-wrap: break-word;
        hyphens: auto;
    }
    /* On mobile, the fixed 122px swatches were getting crammed into
       the center of the viewport with whitespace gutters on each side.
       Switch to a 2-column grid that fills the available width and
       lets the images breathe. */
    @media (max-width: 540px) {
        .question-buttons-container:has(img) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 14px;
            justify-content: stretch;
            padding: 0 4px;
        }
        button:has(img) {
            width: 100%;
            padding: 10px;
        }
        button:has(img) img {
            width: 100%;
            height: auto;
            aspect-ratio: 1 / 1;
            max-width: 180px;
            margin: 0 auto;
        }
    }
</style>
