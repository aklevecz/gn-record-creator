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

// Usage:
// const plainState = serializeDeep(myProxyObject);
