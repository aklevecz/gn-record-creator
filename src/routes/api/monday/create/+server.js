import mondayServer from '$lib/api/monday.server';
import logger from '$lib/logging';

// NEED TO ADD ERROR HANDLING

/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	/** @type {*} */
	const ctx = platform?.context;
	const logging = logger(ctx);
	try {
		const data = await request.json();
		const existingEntry = await mondayServer.getItemById(data.id);
		if (existingEntry) {
			const res = await mondayServer.updateItem(existingEntry.id, data.responses);
			return new Response('UPDATED');
		}
		logging.info(`Creating new entry ${data.id}`);
		const res = await mondayServer.createItem(data.id, data.responses);
		return new Response('NEW ENTRY');

	} catch (e) {
		logging.error(`Error updating entry ${JSON.stringify(e)}`);
		return new Response('ERROR', { status: 500 });
	}

}
