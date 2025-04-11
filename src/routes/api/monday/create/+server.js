import mondayServer from '$lib/api/monday.server';
import errors from '$lib/errors';
import logger from '$lib/logging';
import { error, json } from '@sveltejs/kit';

// NEED TO ADD ERROR HANDLING

/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	/** @type {*} */
	const ctx = platform?.context;
	const logging = logger(ctx);
	try {
		const data = await request.json();
		const existingEntry = await mondayServer.getPageItemById(data.id);
		console.log(`existingEntry: ${JSON.stringify(existingEntry)}`);
		// console.log(`data: ${JSON.stringify(data)}`);
		if (existingEntry) {
			const mondayResponse = await mondayServer.updateItem(existingEntry.id, data.responses);
			return json({ mondayResponse });
		}
		logging.info(`Creating new entry ${data.id}`);
		const mondayResponse = await mondayServer.createItem(data.id, data.responses);
		return json({ mondayResponse });
	} catch (e) {
		logging.error(`Error updating entry ${JSON.stringify(e)}`);
		return error(500, errors.UPDATE_MONDAY_FAILED);
	}
}
