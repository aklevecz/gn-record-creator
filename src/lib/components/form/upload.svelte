<script>
	import uploadApi from '$lib/api/upload';
	import project from '$lib/project.svelte';
	import projects from '$lib/projects.svelte';
	import { cachedKeys } from '$lib/storage';
	import ThreeScene from '$lib/ThreeScene';

	import db from '$lib/db';
	import { calculateFileHash, cropImageToSquare, fileHashExists } from '$lib/utils';

	let {
		multiple = false,
		accept = 'image/*',
		maxSizeMB = 15,
		previewEnabled = false,
		threeScene = new ThreeScene()
	} = $props();

	/**
	 * @typedef {Object} FileWithPreview
	 * @property {string} [preview] - The preview URL for the file
	 */

	// Local state
	/** @type {HTMLInputElement | undefined}*/
	let fileInput = $state();
	/** @type {(File & FileWithPreview)[]} */
	let files = $state([]);
	let isDragging = $state(false);
	let errorMessage = $state('');

	/** @param {number} bytes */
	const bytesToMB = (bytes) => {
		return (bytes / (1024 * 1024)).toFixed(2);
	};

	let error = $state('');

	/** @param {*} event */
	const handleFileSelect = async (event) => {
		error = '';
		errorMessage = '';

		const selectedFile = event.target.files?.[0];
		if (!selectedFile) {
			errorMessage = 'No file found';
			return false;
		}

		if (selectedFile.size > maxSizeMB * 1024 * 1024) {
			errorMessage = `File "${selectedFile.name}" exceeds maximum size of ${maxSizeMB}MB`;
			return false;
		}

		if (!selectedFile.type.startsWith('image/')) {
			errorMessage = `File "${selectedFile.name}" is not an image`;
			return false;
		}
		console.log(selectedFile.size);
		try {
			const projectId = projects.activeProject?.id || 'no-project-id-found';

			const croppedFile = await cropImageToSquare(selectedFile);
			const url = URL.createObjectURL(croppedFile);
			threeScene.updateMaterialTexture(url);
			// WE NEED TO SAVE THESE EVEN IF IT IS A DUPLICATE-- BUT THERE SHOULD BE A BETTER WAY
			db.saveTexture('last-texture', croppedFile);
			// idb.saveTexture({
			// 	imgFile: croppedFile,
			// 	seed: 'user-upload',
			// 	id: 'last-texture',
			// 	projectId: 'active'
			// });

			// const id = selectedFile.name + '_' + Date.now();
			const fileHash = await calculateFileHash(croppedFile);
			const id = fileHash;

			cachedKeys.setProjectTexture(projects.activeProject?.id || 'no-project-id-found', id);

			// END OF SAVING REGLARDLESS OF DUPLICATE

			uploadApi
				.uploadTexture({ id: fileHash, projectId: project.state.id, image: croppedFile })
				.catch((error) => {
					errorMessage = error.message;
					throw new Error(error.message);
				})
			// uploadApi.uploadTexture({
			// 	id: fileHash,
			// 	projectId: project.state.id,
			// 	image: croppedFile
			// });

			// const isDuplicate = await fileHashExists(fileHash, projectId);
			// if (isDuplicate) {
			// 	console.log(`File "${selectedFile.name}" has already been uploaded`);
			// 	return false;
			// }

			// const textureId = `${projects.state.activeProject}-${CURRENT_TEXTURE}`;
			// const textureId = `${projects.activeProject?.id}-${CURRENT_TEXTURE}`;

			// Save the file itself to IDB
			db.saveTexture(id, croppedFile, {
				fileName: selectedFile.name,
				projectId: projects.activeProject?.id || 'no-project-id-found',
				fileHash
			});
			// idb.saveTexture({
			// 	imgFile: croppedFile, // Save the actual File object
			// 	seed: 'user-upload', // Or whatever metadata you want
			// 	// id: textureId,
			// 	fileName: selectedFile.name,
			// 	id,
			// 	projectId: projects.activeProject?.id || 'no-project-id-found',
			// 	fileHash
			// });
		} catch (/** @type {*} */ error) {
			errorMessage = `Error processing image: ${error.message}`;
			console.log('Error cropping image:', error);
			throw new Error(error.message);
		}
	};

	/** @param {*} event */
	const handleDrop = (event) => {
		event.preventDefault();
		isDragging = false;

		if (event.dataTransfer.files && fileInput) {
			fileInput.files = event.dataTransfer.files;
			const changeEvent = new Event('change', { bubbles: true });
			fileInput.dispatchEvent(changeEvent);
		}
	};

	/** @param {*} event */
	const handleDragOver = (event) => {
		event.preventDefault();
		isDragging = true;
	};

	const handleDragLeave = () => {
		isDragging = false;
	};

	/** @param {number} index */
	const removeFile = (index) => {
		const fileToRemove = files[index];

		// Revoke object URL to prevent memory leaks
		if (fileToRemove.preview) {
			URL.revokeObjectURL(fileToRemove.preview);
		}

		files = files.filter((_, i) => i !== index);
		// dispatch('filesSelected', { files });
	};

	// Clean up object URLs when component is destroyed
	const cleanup = () => {
		files.forEach((file) => {
			if (file.preview) {
				URL.revokeObjectURL(file.preview);
			}
		});
	};
</script>

<div class="text-center text-red-500">{error}</div>
{#if previewEnabled && files.length > 0}
	<div class="preview-container">
		<div class="preview-grid">
			{#each files as file, i}
				<div class="preview-item">
					<img src={file.preview} alt={file.name} />
					<div class="preview-info">
						<span class="preview-name">{file.name}</span>
						<span class="preview-size">{bytesToMB(file.size)} MB</span>
						<button class="remove-button" onclick={() => removeFile(i)} aria-label="Remove file">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
<div class="image-uploader md:flex-col">
	<!-- @ts-ignore -->
	<div
		class="dropzone {isDragging ? 'drag-active' : ''}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={() => fileInput && fileInput.click()}
	>
		<input
			type="file"
			bind:this={fileInput}
			onchange={handleFileSelect}
			{accept}
			{multiple}
			class="file-input"
		/>

		<div class="dropzone-content">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="black"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
				<polyline points="17 8 12 3 7 8"></polyline>
				<line x1="12" y1="3" x2="12" y2="15"></line>
			</svg>
			<p>
				{isDragging ? 'Drop images here' : 'Upload image'}
			</p>

			<!-- <span class="hint">
				Max size: {maxSizeMB}MB | {multiple ? 'Multiple files allowed' : 'Single file only'}
			</span> -->
		</div>
		<div class="desk-cta">Click or drag and drop to upload</div>
	</div>
	<!-- Error message display -->
	{#if errorMessage}
		<div class="error-message">
			{errorMessage}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss/theme";

	.drag-active {
		border-color: #4299e1 !important;
		background-color: rgb(255, 255, 69) !important;
	}

	.image-uploader {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		color: black;
		font-weight: 500;
	}

	.dropzone {
		/* border: 2px dashed #cbd5e0; */
		border-radius: 0.5rem;
		padding: 0.5rem;
		margin: 1rem auto;
		width: 150px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background-color: #f7fafc;
		@apply flex flex-col items-center justify-center md:h-[89px] md:w-[290px];
	}

	.dropzone:hover {
		border-color: #a0aec0;
	}

	.dropzone-content {
		display: flex;
		/* flex-direction: column; */
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		color: black;
		font-weight: 500;
	}

	.dropzone-content svg {
		/* margin-bottom: 0.5rem; */
		color: #718096;
	}

	.dropzone-content p {
		/* margin: 0.5rem 0; */
		font-size: 1rem;
		font-weight: bold;
	}

	.hint {
		font-size: 0.5rem;
		color: #718096;
	}

	.file-input {
		display: none;
	}

	.error-message {
		margin-top: 0.5rem;
		color: #e53e3e;
		font-size: 0.875rem;
	}

	.preview-container {
		margin-top: 1.5rem;
	}

	.preview-container h3 {
		font-size: 1rem;
		margin-bottom: 0.75rem;
		font-weight: 500;
		color: #2d3748;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
	}

	.preview-item {
		border-radius: 0.375rem;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.preview-item img {
		width: 100%;
		height: 120px;
		object-fit: cover;
		display: block;
	}

	.preview-info {
		padding: 0.5rem;
		font-size: 0.75rem;
		background-color: white;
	}

	.preview-name {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 500;
	}

	.preview-size {
		color: #718096;
	}

	.remove-button {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		background-color: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: 9999px;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.desk-cta {
		@apply hidden md:block;
	}

	/* .desk-cta:hover {
		@apply hidden;
	}

	.remove-button:hover {
		background-color: rgba(0, 0, 0, 0.7);
	} */
</style>
