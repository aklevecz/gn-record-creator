<script>
    import Detail from '$lib/components/form/detail.svelte';
    import Question from '$lib/components/form/question.svelte';
    import details from '$lib/details.svelte';
    import project from '$lib/project.svelte';
    import { questions } from '$lib/survey.svelte';

    import { goto } from '$app/navigation';
    import surveyApi from '$lib/api/survey';
    import mondayClientApi from '$lib/api/monday';
    import ThreeHomepage from '$lib/components/three/three-homepage.svelte';
    import { debounce, hashFunction } from '$lib/utils';
    import projects from '$lib/projects.svelte';
    import { dev } from '$app/environment';
    import { FIVE_SECONDS, THIRTY_SECONDS_MS } from '$lib/constants';
    import network from '$lib/network.svelte';
    import QuestionDropdown from '$lib/components/form/question-dropdown.svelte';

    let submitting = $state(false);
    async function submitInfo() {
        submitting = true;
        const detailResponses = details.remapDetails();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await surveyApi.create({
            id: project.state.id,
            responses: { ...detailResponses, status: 'submitted' }
        });
        await mondayClientApi.create({
            id: project.state.id,
            responses: { ...detailResponses, status: 'Submitted' }
        });
        submitting = false;
        goto(`/submission/${project.state.id}`);
    }

    const debouncedSaveRemote = debounce(
        (/** @type {*} */ collectedData) => {
            mondayClientApi.create(collectedData);
            surveyApi.create(collectedData);
        },
        dev ? FIVE_SECONDS : THIRTY_SECONDS_MS
    );

    // ADDED THIS TO THE project.svelte
    // let detailsHash = $state('');
    // // THIS GETS TRIGGERED A LOT AT INITIATION
    // $effect(() => {
    // 	if (!projects.state.initialized) return;
    // 	const detailResponses = details.remapDetails();
    // 	const hash = hashFunction(detailResponses);

    // 	// IGNORE FIRST UPDATE
    // 	if (detailsHash === '') {
    // 		detailsHash = hash;
    // 		return;
    // 	}

    // 	// THIS COULD ALSO JUST BE IN DETAILS? - but it's also kind of nice to have it explicitly on this page
    // 	if (hash !== detailsHash) {
    // 		detailsHash = hash;
    // 		debouncedSaveRemote({ id: project.state.id, responses: { ...detailResponses } });
    // 	}
    // });
</script>

<div class="survey-page">
    <h1 class="survey-page-header text-2xl font-bold">Record Setup Form</h1>
    <div class="survey-page-cta text-xs">
        Please fill out the following information so we can set up your project in our system,
        verify production schedule and get you quotes.
    </div>

    <!-- COULD BE ITS OWN COMPONTENT CALLED LIKE SURVEYSOMETHING -->
    <!-- BEGIN SURVEY -->
    <div class="survey-questions">
        {#each Object.entries(details.state.details) as [key, detail]}
            {@const type = detail.type}
            {#if type === 'select'}
                {@const question = questions[key]}
                {#if question}
                    <Question {key} label={question.label} options={question.options} />
                    <QuestionDropdown {key} label={question.label} options={question.options} />
                {/if}
            {:else}
                <Detail label={detail.label} {key} description={detail.description} />
            {/if}
        {/each}
    </div>
    <!-- END SURVEY -->

    <!-- FLOATING THREEJS RECORD VISUAL -->
    {#if projects.state.initialized}<ThreeHomepage />{/if}
    <!-- END FLOATING THREEJS RECORD VISUAL -->

    <!-- SUBMIT SURVEY -->
    <div class="survey-submit my-10">
        <div class="survey-submit-cta mb-2 p-4">
            Press submit if you have finished filling out all of the required info. You will be able
            to edit things later.
        </div>
        <button onclick={submitInfo} class="mx-auto block text-xl">
            {#if submitting}
                <img
                    class="mx-auto"
                    class:isSubmitting={submitting}
                    src="/characters/juggle-color.svg"
                    alt="juggle graphic"
                />
                Submitting
            {:else}
                Submit
            {/if}
        </button>
    </div>
    <!-- END SUBMIT SURVEY -->
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";

    .survey-page {
        @apply mx-auto mb-10 max-w-[570px] rounded-md p-0 px-6 md:mx-0;
    }

    .survey-questions {
        @apply mt-4 flex flex-col gap-4;
    }

    .design-creator-container {
        @apply fixed md:fixed md:top-0;
    }
    img.isSubmitting {
        animation: hue-rotate 1s infinite;
    }
    @keyframes hue-rotate {
        from {
            filter: hue-rotate(0deg);
        }
        to {
            filter: hue-rotate(360deg);
        }
    }
</style>
