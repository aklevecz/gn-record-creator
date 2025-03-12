/** @param {string} imageUrl */
export async function fetchImageAsBase64(imageUrl) {
	try {
		// Fetch the image
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Get the image data as a blob
		const blob = await response.blob();

		// Create a FileReader to convert blob to base64
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onloadend = () => {
				// reader.result contains the base64 string
				resolve(reader.result);
			};

			reader.onerror = () => {
				reject(new Error('Failed to convert image to base64'));
			};

			// Start reading the blob as a data URL (base64)
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error('Error converting image to base64:', error);
		throw error;
	}
}

/**
 * Fetches an image from a URL and returns it as a Blob for storing in IndexedDB
 * @param {string} imageUrl - The URL of the image to fetch
 * @returns {Promise<Blob>} A promise that resolves with the image Blob
 */
export async function fetchImageAsBlob(imageUrl) {
	try {
		// Fetch the image
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Get the image data as a blob directly from the response
		return await response.blob();
	} catch (error) {
		console.error('Error fetching image as blob:', error);
		throw error;
	}
}

/**
 * Deeply serializes an object tree, handling proxy objects and circular references
 * @param {any} obj - The object to serialize
 * @param {WeakMap<any, any>} [seen=new WeakMap()] - Internal parameter to track circular references
 * @returns {any} A plain JavaScript object/value
 */
export function serializeDeep(obj, seen = new WeakMap()) {
	// Handle primitives and null
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	// Handle Date objects
	if (obj instanceof Date) {
		return new Date(obj);
	}

	// Check for circular references
	if (seen.has(obj)) {
		return '[Circular Reference]';
	}

	// Remember this object to detect circular references
	seen.set(obj, true);

	// Handle arrays
	if (Array.isArray(obj)) {
		return obj.map((item) => serializeDeep(item, seen));
	}

	// Handle regular objects and proxies
	const plainObj = {};

	// Get all enumerable properties
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			// @ts-ignore
			plainObj[key] = serializeDeep(obj[key], seen);
		}
	}

	return plainObj;
}

/**
 * Creates a debounced function that delays invoking the provided function until after
 * the specified wait time has elapsed since the last time it was invoked.
 * @template {Object} T - The type of the 'this' context
 * @param {function(this:T, ...any):void} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @return {function(this:T, ...any):void} The debounced function
 */
export function debounce(func, wait) {
	/** @type {ReturnType<typeof setTimeout>|undefined} */
	let timeout = undefined;

	/**
	 * @this {T}
	 * @param {...any} args
	 * @return {void}
	 */
	return function (...args) {
		const later = () => {
			clearTimeout(timeout);
			func.apply(this, args);
		};

		if (timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(later, wait);
	};
}

/**
 * Crops an image to a square from the center
 * @param {File} file - The original image file
 * @returns {Promise<File>} - A promise that resolves to the cropped file
 */
export const cropImageToSquare = (file) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			// Create canvas for cropping
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				reject(new Error('Failed to create canvas for cropping'));
				return;
			}

			// Determine the size of the square (use the smaller dimension)
			const size = Math.min(img.width, img.height);

			// Set canvas size to our target square size
			canvas.width = size;
			canvas.height = size;

			// Calculate centering offset
			const offsetX = (img.width - size) / 2;
			const offsetY = (img.height - size) / 2;

			// Draw the centered square portion onto the canvas
			ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

			// Convert canvas back to a Blob, then to a File
			canvas.toBlob((blob) => {
				if (!blob) {
					reject(new Error('Failed to create cropped file'));
					return file;
				}
				// Create a new file with the same name but cropped content
				const croppedFile = new File([blob], file.name, {
					type: file.type,
					lastModified: file.lastModified
				});
				resolve(croppedFile);
			}, file.type);
		};

		img.onerror = () => {
			reject(new Error('Failed to load image for cropping'));
		};

		// Load the image from the file
		img.src = URL.createObjectURL(file);
	});
};
