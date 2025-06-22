<script>
    import { goto } from '$app/navigation';
    import mondayClientApi from '$lib/api/monday';
    import surveyApi from '$lib/api/survey';
    import Detail from '$lib/components/form/detail.svelte';
    import QuestionDropdown from '$lib/components/form/question-dropdown.svelte';
    import Question from '$lib/components/form/question.svelte';
    import AddressInput from '$lib/components/input/address-input.svelte';
    import ThreeHomepage from '$lib/components/three/three-homepage.svelte';
    import Modal from '$lib/components/ui/modal.svelte';
    import Scroller2D from '$lib/components/game/Scroller2D.svelte';
    import details from '$lib/details.svelte';
    import { formFields, hiddenFields } from '$lib/monday/formFields';
    import project from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import { Spring } from 'svelte/motion';
    import * as Sentry from '@sentry/sveltekit';

    /** @type {string[]} */
    let missingKeys = $state([]);
    let submitting = $state(false);
    let showMissingFieldsModal = $state(false);

    async function submitInfo() {
        submitting = true;
        const { isValid, missingFields } = details.validateFormFinished();
        if (!isValid) {
            missingKeys = missingFields;
            submitting = false;
            showMissingFieldsModal = true;
            return;
        }
        const detailResponses = details.remapDetailsAndStringify();
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // SHOULD THERE BE SOME STATUS TO INDICATE THAT THEY SUBMITTED THE FORM
        await surveyApi.create({
            id: project.state.id,
            mondayId: project.state.mondayId,
            responses: { ...detailResponses, submitted: 'Submitted' }
        });
        try {
            await mondayClientApi.create({
                id: project.state.id,
                mondayId: project.state.mondayId,
                responses: { ...detailResponses, submitted: 'Submitted' }
            });
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            // silent
        }
        submitting = false;
        goto(`/submission/${project.state.id}`);
    }

    const offScreenSpring = -50;
    const spring = new Spring(offScreenSpring, {
        damping: 1.2,
        stiffness: 0.1
    });

    $effect(() => {
        if (details.state.contact_first_name.value) {
            setTimeout(() => {
                spring.set(0);
                setTimeout(() => {
                    spring.set(offScreenSpring);
                }, 2000);
            }, 2000);
        } else {
            spring.set(offScreenSpring);
        }
    });
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
        {#each Object.entries(details.state).filter(([key, detail]) => !hiddenFields.includes(key)) as [key, detail]}
            {@const type = detail.type}
            {@const question = formFields[key]}
            {#if type === 'select'}
                <!-- Buttons instead of input element -- maybe only for the record color picker? -->
                <Question
                    {key}
                    label={question.label}
                    options={question.options || []}
                    required={detail.required}
                    maxSelections={detail.maxSelections ?? 1}
                />
            {:else if type === 'dropdown'}
                <QuestionDropdown
                    {key}
                    label={question.label}
                    options={question.options}
                    required={detail.required}
                    description={detail.description}
                />
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
                <!-- <Tooltip tooltip={detail.tooltip} /> -->
            {/if}
        {/each}
    </div>
    <!-- END SURVEY -->

    <!-- THIS COULD ALSO BE THE SIDEPANEL OR END OF SURVEY -->
    <!-- FLOATING THREEJS RECORD VISUAL -->
    {#if projects.initialized}<ThreeHomepage />{/if}
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
    

    
    <!-- <CalculatorFooter /> -->
</div>

<!-- <Groovy text={`Hello ${details.state.contact_first_name.value}!`} bottomPercent={spring.current} /> -->

<Modal bind:isOpen={showMissingFieldsModal} onclose={() => {}} title="Missing Required Fields" size="md">
    <div class="missing-fields-content">
        <p class="mb-4">Please complete the following required fields before submitting:</p>
        <ul class="missing-fields-list">
            {#each missingKeys as key}
                <li class="missing-field-item">
                    <span class="field-name">{formFields[key]?.label || key}</span>
                </li>
            {/each}
        </ul>
    </div>

    <div slot="footer">
        <button class="modal-button modal-button-primary" onclick={() => (showMissingFieldsModal = false)}> OK, I'll complete these fields </button>
    </div>
</Modal>

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
    /* 
    .missing-fields-content {
        @apply text-gray-700;
    } */

    .missing-fields-list {
        @apply list-none space-y-2 pl-0;
    }

    .missing-field-item {
        @apply flex items-center rounded px-0 py-2;
    }

    .field-name {
        @apply font-medium text-[var(--red)];
    }

    /* .modal-button {
        @apply px-4 py-2 border rounded font-medium transition-colors duration-200;
    }

    .modal-button-primary {
        @apply bg-blue-600 text-white border-blue-600 hover:bg-blue-700;
    } */
</style>
