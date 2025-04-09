<script>
    import details from '$lib/details.svelte';

    /** @type {{label: string, options: Option[], key: string, required: boolean}}*/
    let { label, options, key, required } = $props();

    /** @param {Option} option */
    function handleAnswer(option) {
        // survey.answer(key, option.text);
        details.setValue(key, option.text);
    }
</script>

<div class="question-container">
    <div class="label">
        {label}{#if required}*{/if}
    </div>
    <div class="question-buttons-container">
        {#each options as option}
            <!-- {JSON.stringify(survey.state.answers[key] === option.text)} -->
            <button
                class:isSelected={details.state[key].value === option.text}
                onclick={() => handleAnswer(option)}
            >
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
