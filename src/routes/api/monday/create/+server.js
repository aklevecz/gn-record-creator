import mondayServer from '$lib/api/monday.server';

// NEED TO ADD ERROR HANDLING

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const data = await request.json();
	const existingEntry = await mondayServer.getItemById(data.id);
	if (existingEntry) {
		const res = await mondayServer.updateItem(existingEntry.id, data.responses)
		return new Response("UPDATED");
	}

	const res = await mondayServer.createItem(data.id, data.responses);
	return new Response("NEW ENTRY");
}
