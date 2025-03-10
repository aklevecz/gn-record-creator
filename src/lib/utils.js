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
