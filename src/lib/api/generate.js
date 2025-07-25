import configurations from '$lib/configurations';
import { GenerationErrors } from '$lib/generate.svelte';

let endpoints = {
	generate: '/api/generate'
};

let generateApi = () => {
	return {
		/**
		 * Makes a POST request to the /generate endpoint with a prompt as
		 * JSON. Returns the response as a Promise.
		 *
		 * @param {string} prompt The prompt to generate an image for.
		 * @param {string} model The model to use for generation.
		 * @return {Promise<ReplicateResponse>} The response from the server.
		 */
		generate: async (prompt, model) => {
			let configuration = configurations[model];
			console.log(`Configuration for model ${model}:`, configuration);
			// try {
			let res = await fetch(endpoints.generate, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: model,
					// could also do this server side
					prompt: prompt
						.toLocaleLowerCase()
						.replaceAll(configuration.promptWord, configuration.triggerWord)
				})
			});
			let data = await res.json();

			if (!res.ok) {
                console.log("Failed to generate image on Replicate: " + prompt + " " + JSON.stringify(configuration));
                console.log(data.code)
				throw new Error(data.code);
			}
			return data;
			// } catch (error) {
			//     console.log(error)
			//     throw new Error(GenerationErrors.NETWORK)
			// }
		},
		/**
		 * Makes a GET request to the /generate endpoint with a generation ID
		 * as a query string parameter. Returns the response as a Promise.
		 *
		 * @param {string} id The ID of the generation to check.
		 * @return {Promise<ReplicateResponse>} The response from the server.
		 */
		checkGeneration: async (id) => {
			let res = await fetch(`${endpoints.generate}?id=${id}`);
			let data = await res.json();
			return data;
		}
	};
};

export default generateApi();
