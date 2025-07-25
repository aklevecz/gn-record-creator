import { REPLICATE_API_TOKEN } from '$env/static/private';
import configurations from '$lib/configurations';
import errors from '$lib/errors';
import logger from '$lib/logging';
// import configuration from "$lib/configuration";
import { error, json } from '@sveltejs/kit';

const headers = {
	Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
	'Content-Type': 'application/json'
	//   'Prefer': 'wait'
};

/**
 * @param {string} prompt - The prompt for the prediction
 * @returns {Promise<ReplicateResponse>}
 */
// async function makeReplicateRequestPrivate(prompt) {
//     const url = 'https://api.replicate.com/v1/deployments/aklevecz/cog-flux-schnell-lora/predictions';

//     const body = JSON.stringify({
//       input: {
//         prompt: prompt,
//         hf_lora: configuration.model,
//       }
//     });

//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: headers,
//         body: body
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(data);
//       return data;
//     } catch (error) {
//       console.error('There was a problem with the fetch operation:', error);
//       throw error;
//     }
//   }

/**
 * @param {string} prompt - The prompt for the prediction
 * @param {import("$lib/configurations").Configuration} configuration - The configuration for the prediction
 * @returns {Promise<ReplicateResponse | undefined>} - The prediction result
 */
const makeReplicateRequestPublic = async (prompt, configuration) => {
	let baseUrl = 'https://api.replicate.com/v1';
	let url = `${baseUrl}/predictions`;

	// For flux ultra or new api structure
	if (configuration.model.includes('ultra')) {
		url = `${baseUrl}/models/${configuration.model}/predictions`;
	}
	const headers = {
		Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
		'Content-Type': 'application/json'
	};
			// hf_lora: configuration.model
	const input = { prompt: prompt, ...configuration.modelParams };
	const body = JSON.stringify({
		version: configuration.replicateId,
		input
	});

	// try {
	const response = await fetch(url, {
		method: 'POST',
		headers: headers,
		body: body
	});

	if (!response.ok) {
		throw new Error(`Error trying to generate image on Replicate: ${prompt} ${JSON.stringify(configuration.modelParams)}`);
	}

	const data = await response.json();
	return data;
	// } catch (error) {
	// 	console.error('There was a problem with the fetch operation:', error);
	// }
};

/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	/** @type {*} */
	const ctx = platform?.context;
	const logging = logger(ctx);
	const { prompt, model } = await request.json();
	try {
		const configuration = configurations[model];
		console.log(`Configuration for model ${model}:`, configuration);
		const data = await makeReplicateRequestPublic(prompt, configuration);
		logging.info(`Successful image gen call ${JSON.stringify(data)}`);
		return json(data);
	} catch (e) {
		logging.error(`Failed to generate image on Replicate: ${prompt} ${JSON.stringify(model)}`);
		throw error(500, errors.IMAGE_GENERATION_FAILED);
	}
}

export async function GET({ url }) {
	const id = url.searchParams.get('id');
	const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, { headers });
	const data = await res.json();
	return json(data);
}
