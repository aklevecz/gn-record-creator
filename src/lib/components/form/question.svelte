<script>
	import details from '$lib/details.svelte';
	import survey from '$lib/survey.svelte';

	/** @type {{label: string, options: Option[], key: string}}*/
	let { label, options, key } = $props();

	/** @param {Option} option */
	function handleAnswer(option) {
		// survey.answer(key, option.text);
		details.setValue(key, option.text);
	}
</script>
<div class="question-container">
	<div class="label">{label}</div>
	<div class="buttons-container">
		{#each options as option}
        <!-- {JSON.stringify(survey.state.answers[key] === option.text)} -->
			<button class:isSelected={details.state.details[key].value === option.text} onclick={() => handleAnswer(option)}>
				{#if option.img}
					<img src={option.img} alt={option.text} />
				{/if}{option.text}</button
			>
		{/each}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";
	.question-container {
		@apply flex flex-col gap-2 mt-4;
	}
    .label {
        @apply text-lg font-semibold;
    }
    .buttons-container {
        @apply flex flex-wrap gap-2;
    }
	button {
		@apply w-[150px] text-base font-bold rounded-md capitalize select-none;
	}
    button.isSelected {
        @apply bg-[var(--accent-color)];
    }
	img {
		@apply w-full mb-1;
	}
</style>
