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
    import CalculatorFooter from '$lib/components/info/calculator-footer.svelte';
    import details from '$lib/details.svelte';
    import { formFields, hiddenFields } from '$lib/monday/formFields';
    import project from '$lib/project.svelte';
    import projects from '$lib/projects.svelte';
    import { Spring } from 'svelte/motion';
    import * as Sentry from '@sentry/sveltekit';
    import db from '$lib/db';
    import { serializeDeep } from '$lib/utils';

    /** @type {string[]} */
    let missingKeys = $state([]);
    let submitting = $state(false);
    let showMissingFieldsModal = $state(false);

    let hasSubmitted = $derived(project.state.hasSubmitted);

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
        let mondayId = project.state.mondayId;
        try {
            const mondayRes = await mondayClientApi.create({
                id: project.state.id,
                mondayId: project.state.mondayId,
                responses: { ...detailResponses, submitted: 'Submitted' }
            });
            mondayId = mondayRes.mondayId;
            project.state.mondayId = mondayId;
            projects.updateProject(serializeDeep(project.state));
            project.state.hasSubmitted = true;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            // silent
        }
        await surveyApi.create({
            id: project.state.id,
            mondayId,
            responses: { ...detailResponses, submitted: 'Submitted' }
        });

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
<svelte:head>
<title>Record Setup Form - Good Neighbor Record Creator</title>
<meta name="description" content="Howdy! Ready to make some records? Fill out our friendly setup form to get your vinyl pressing project started with Good Neighbor." />
<meta property="og:title" content="Record Setup Form - Good Neighbor Record Creator" />
<meta property="og:description" content="Howdy! Ready to make some records? Fill out our friendly setup form to get your vinyl pressing project started with Good Neighbor." />
<meta property="og:image" content="/characters/carry-blackwhite.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Record Setup Form - Good Neighbor Record Creator" />
<meta name="twitter:description" content="Howdy! Ready to make some records? Fill out our friendly setup form to get your vinyl pressing project started with Good Neighbor." />
<meta name="twitter:image" content="/characters/carry-blackwhite.png" />
</svelte:head>
<div class="survey-page">
    <header class="survey-header">
        <span class="gn-pill">Setup form</span>
        <h1 class="survey-title">Make a record</h1>
        <p class="gn-lead survey-subtitle">
            Tell us about your project. We'll use this to set you up in our system, confirm your production schedule, and quote you.
        </p>
    </header>
    {#if hasSubmitted}
        <div class="submitted-banner">You have already submitted this project.</div>
    {/if}
    <!-- COULD BE ITS OWN COMPONTENT CALLED LIKE SURVEYSOMETHING -->
    <!-- BEGIN SURVEY -->
    <!-- TODO: DIFFERENCE BETWEEN QUESTION AND DETAIL IS CONFUSING -->
    <div class="survey-questions" style={hasSubmitted ? 'pointer-events:none;opacity: .25;' : ''}>
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
                <div class="missing-field-inline">
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
    <div class="survey-submit">
        {#if !hasSubmitted}
            <p class="survey-submit-cta">Once everything is filled out, hit submit and we'll take it from there.</p>
        {/if}
        <button disabled={hasSubmitted} onclick={submitInfo} class="gn-btn--hero submit-btn">
            {#if submitting}
                <img class="submit-glyph" class:isSubmitting={submitting} src="/characters/juggle-color.svg" alt="" />
                Submitting
            {:else}
                Submit
            {/if}
        </button>
    </div>
    <!-- END SUBMIT SURVEY -->

    <CalculatorFooter />
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

<style>
    .survey-page {
        max-width: 560px;
        margin: 0 0 200px;
        padding: 32px 24px 48px 40px;
    }
    @media (min-width: 768px) {
        .survey-page {
            padding-left: 64px;
        }
    }
    .survey-header {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 28px;
    }
    .survey-title {
        font-family: var(--gn-font-display);
        font-size: clamp(32px, 4.5vw, 48px);
        line-height: 1;
        letter-spacing: -0.02em;
        margin: 0;
    }
    .survey-subtitle {
        color: var(--gn-fg-2);
        max-width: 520px;
    }
    .submitted-banner {
        display: inline-flex;
        align-items: center;
        padding: 10px 18px;
        border-radius: var(--gn-r-full);
        background: var(--gn-vinyl-green);
        color: var(--gn-paper);
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 16px;
    }
    .survey-questions {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .missing-field-inline {
        margin-top: -8px;
        font-size: 12px;
        font-weight: 700;
        color: var(--gn-vinyl-red);
    }
    .survey-submit {
        margin: 56px 0;
        text-align: center;
    }
    .survey-submit-cta {
        color: var(--gn-fg-2);
        margin-bottom: 16px;
    }
    .submit-btn {
        margin: 0 auto;
        background: var(--gn-sunshine);
        color: var(--gn-ink);
    }
    .submit-btn:hover:not(:disabled) {
        background: var(--gn-sunshine-2);
    }
    .submit-glyph {
        width: 28px;
        height: 28px;
    }
    .isSubmitting {
        animation: hue-rotate 1s linear infinite;
    }
    @keyframes hue-rotate {
        from {
            filter: hue-rotate(0deg);
        }
        to {
            filter: hue-rotate(360deg);
        }
    }
    .missing-fields-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .missing-field-item {
        padding: 6px 0;
    }
    .field-name {
        font-weight: 700;
        color: var(--gn-vinyl-red);
    }
</style>
