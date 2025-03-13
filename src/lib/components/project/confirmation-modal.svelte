<script>
	let { isOpen, title, message, confirmButtonText, cancelButtonText, onConfirm, onCancel } =
		$props();
</script>

{#if isOpen}
	<div class="modal-backdrop">
		<div class="modal">
			<div class="modal-header">
				<h2>{title}</h2>
			</div>
			<div class="modal-body">
				<p>{message}</p>
			</div>
			<div class="modal-footer">
				<button class="cancel-button" onclick={onCancel}>{cancelButtonText}</button>
				<button
					class="confirm-button"
					onclick={() => {
						onConfirm();
						isOpen = false;
					}}>{confirmButtonText}</button
				>
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	@reference "tailwindcss/theme";

	.modal-backdrop {
		@apply opacity-100 fixed inset-0 z-50 flex items-center justify-center bg-none;
	}

	.modal {
		@apply mx-4 w-full max-w-sm rounded-md text-black bg-white p-4;
	}

	.modal-header {
		@apply mb-2;
	}

	.modal-header h2 {
		@apply text-lg font-bold;
	}

	.modal-body {
		@apply mb-4;
	}

	.modal-footer {
		@apply flex justify-end gap-2;
	}

	.cancel-button {
		@apply rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300;
	}

	.confirm-button {
		@apply rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600;
	}
</style>
