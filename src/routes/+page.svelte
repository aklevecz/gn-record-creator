<script>
    import { goto } from '$app/navigation';
    import mondayClientApi from '$lib/api/monday';
    import surveyApi from '$lib/api/survey';
    import Detail from '$lib/components/form/detail.svelte';
    import QuestionDropdown from '$lib/components/form/question-dropdown.svelte';
    import Question from '$lib/components/form/question.svelte';
    import Tooltip from '$lib/components/form/tooltip.svelte';
    import CalculatorFooter from '$lib/components/info/calculator-footer.svelte';
    import AddressInput from '$lib/components/input/address-input.svelte';
    import ThreeHomepage from '$lib/components/three/three-homepage.svelte';
    import details from '$lib/details.svelte';
    import project from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import { questions } from '$lib/survey-data-model';

    /** @type {string[]} */
    let missingKeys = $state([]);
    let submitting = $state(false);
    async function submitInfo() {
        submitting = true;
        const { isValid, missingFields } = details.validateFormFinished();
        if (!isValid) {
            missingKeys = missingFields;
            alert("You aren't done filling out the form");
            return;
        }
        const detailResponses = details.remapDetails();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await surveyApi.create({
            id: project.state.id,
            mondayId: project.state.mondayId,
            responses: { ...detailResponses, status: 'submitted' }
        });
        await mondayClientApi.create({
            id: project.state.id,
            mondayId: project.state.mondayId,
            responses: { ...detailResponses, status: 'Submitted' }
        });
        submitting = false;
        goto(`/submission/${project.state.id}`);
    }
</script>
<div class="survey-page">
    <h1 class="survey-page-header text-2xl font-bold">Record Setup Form</h1>
    <div class="survey-page-cta text-xs">
        Please fill out the following information so we can set up your project in our system, verify production schedule and get you quotes.
    </div>

    <!-- COULD BE ITS OWN COMPONTENT CALLED LIKE SURVEYSOMETHING -->
    <!-- BEGIN SURVEY -->
    <!-- TODO: DIFFERENCE BETWEEN QUESTION AND DETAIL IS CONFUSING -->
    <div class="survey-questions">
        {#each Object.entries(details.state) as [key, detail]}
            {@const type = detail.type}
            {@const question = questions[key]}
            {#if type === 'select'}
                <!-- Buttons instead of input element -- maybe only for the record color picker? -->
                <Question {key} label={question.label} options={question.options} required={detail.required} />
            {:else if type === 'dropdown'}
                <QuestionDropdown {key} label={question.label} options={question.options} required={detail.required} />
            {:else if type === 'address'}
                <AddressInput {key} label={detail.label} description={detail.description} required={detail.required} />
            {:else}
                <Detail label={detail.label} {key} description={detail.description} type={detail.type} required={detail.required} />
            {/if}
            {#if missingKeys.includes(key)}
                <div class="mt-[-10px] text-xs text-[var(--red)]">
                    {detail.label} is required
                </div>
            {/if}
            {#if detail.tooltip}
                <Tooltip tooltip={detail.tooltip} />
            {/if}
        {/each}
    </div>
    <!-- END SURVEY -->

    <!-- THIS COULD ALSO BE THE SIDEPANEL OR END OF SURVEY -->
    <!-- FLOATING THREEJS RECORD VISUAL -->
    {#if projects.state.initialized}<ThreeHomepage />{/if}
    <!-- END FLOATING THREEJS RECORD VISUAL -->

    <!-- SUBMIT SURVEY -->
    <div class="survey-submit my-10">
        <div class="survey-submit-cta mb-2 p-4">
            Press submit if you have finished filling out all of the required info. You will be able to edit things later.
        </div>
        <button onclick={submitInfo} class="mx-auto block text-xl">
            {#if submitting}
                <img class="mx-auto" class:isSubmitting={submitting} src="/characters/juggle-color.svg" alt="juggle graphic" />
                Submitting
            {:else}
                Submit
            {/if}
        </button>
    </div>
    <!-- END SUBMIT SURVEY -->

    <CalculatorFooter />
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";

    .survey-page {
        @apply mx-auto mb-20 max-w-[570px] rounded-md p-0 px-6 md:mx-0;
    }

    .survey-questions {
        @apply mt-4 flex flex-col gap-4;
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
