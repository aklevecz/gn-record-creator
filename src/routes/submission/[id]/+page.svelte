<script>
	import { onMount } from 'svelte';

	
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	/** @type {Submission} */
	let submission = data.submission;
	console.log(submission)
</script>

<div class="flex items-center gap-4 justify-center">
	<div class="flex-[0_1_50%] text-xl font-bold">
		Thank you for your submission! We'll get back to you soon!
	</div>
	<img src="/characters/infatuation-color.svg" class="invert" alt="Infatuation" />
</div>
<div class="container">
	<div class="submission-container">
		<div class="submission-header">
			<h2>Submission Details</h2>
			<div class="submission-id">Id: {submission.id}</div>
        <img class="w-50" src={`/api/upload/${submission.id}`} alt="Submission" />
		</div>


		{#snippet submissionField(/** @type {*} */ props)}
			<div class="field">
				<div class="label">{props.label}</div>
				<span id={props.label}>{props.value}</span>
			</div>
		{/snippet}

		<div class="submission-section">
			<h3>Project Information</h3>
			{@render submissionField({ label: 'Project Name', value: submission.project_name })}
			{@render submissionField({ label: 'Artist Name', value: submission.artist })}
			{@render submissionField({ label: 'Label', value: submission.label })}
			{@render submissionField({ label: 'Catalog Number', value: submission.catalog_number })}
		</div>

		<div class="submission-section">
			<h3>Contact Information</h3>
            {@render submissionField({ label: 'Contact Name', value: submission.contact_name })}
            {@render submissionField({ label: 'Contact Email', value: submission.contact_email })}
            {@render submissionField({ label: 'Phone', value: submission.phone })}
		</div>

		<div class="submission-section">
			<h3>Release Details</h3>
            {@render submissionField({label: 'Release Date', value: submission.release_date})}
            {@render submissionField({label: 'Depot Date', value: submission.depot_date})}
		</div>

		<div class="submission-section">
			<h3>Shipping Information</h3>
            {@render submissionField({label: 'Shipping Address', value: submission.shipping_address})}
            {@render submissionField({label: 'Shipping Logistics', value: submission.shipping_logistics})}
		</div>

		<div class="submission-section">
			<h3>Product Specifications</h3>
            {@render submissionField({label: 'Total Units', value: submission.total_units})}
            {@render submissionField({label: 'Records Per Set', value: submission.records_per_set})}
            {@render submissionField({label: 'Record Format', value: submission.record_format})}
            {@render submissionField({label: 'Record Color', value: submission.record_color})}
            {@render submissionField({label: 'Laquers', value: submission.lacquers})}
            {@render submissionField({label: 'Metalwork', value: submission.metalwork})}
            {@render submissionField({label: 'Test Prints', value: submission.test_prints})}
            {@render submissionField({label: 'Packaging', value: submission.packaging})}
		</div>

		<div class="submission-section">
			<h3>Additional Notes</h3>
            {@render submissionField({label: 'Notes', value: submission.notes})}
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";
	.container {
		@apply mx-auto mt-4 flex w-full flex-col items-center justify-center gap-4;
	}
	.submission-container {
		@apply bg-[var(--secondary-color)] px-6 py-6 text-[var(--primary-color)];
	}
    .submission-header {
        @apply mb-6;
    }
    h2 {
        @apply text-2xl font-bold;
    }
    h3 {
        @apply text-xl font-bold mb-0;
    }
    .submission-section {
        @apply mb-4;
    }
    .field {
        @apply flex gap-4 pl-0 mb-1 items-end;
    }
    .field > .label {
        @apply font-semibold text-sm;
    }
</style>
