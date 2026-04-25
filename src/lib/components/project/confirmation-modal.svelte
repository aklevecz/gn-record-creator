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

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(20, 20, 18, 0.55);
		backdrop-filter: blur(4px);
		padding: 16px;
	}
	.modal {
		background: var(--gn-paper);
		color: var(--gn-ink);
		border-radius: var(--gn-r-xl);
		padding: 28px;
		width: 100%;
		max-width: 440px;
		box-shadow:
			0 12px 27px rgba(0, 0, 0, 0.2),
			0 49px 49px rgba(0, 0, 0, 0.17);
		font-family: var(--gn-font-sans);
	}
	.modal-header h2 {
		font-family: var(--gn-font-display);
		font-size: 26px;
		line-height: 1;
		letter-spacing: -0.02em;
		margin: 0 0 12px;
	}
	.modal-body {
		margin-bottom: 20px;
		color: var(--gn-fg-2);
	}
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
	}
	.cancel-button {
		background: var(--gn-paper);
		color: var(--gn-ink);
		box-shadow: inset 0 0 0 1px var(--gn-ink);
	}
	.cancel-button:hover:not(:disabled) {
		background: var(--gn-n-150);
	}
	.confirm-button {
		background: var(--gn-vinyl-red);
		color: var(--gn-paper);
	}
	.confirm-button:hover:not(:disabled) {
		background: #c41e1f;
	}
</style>
