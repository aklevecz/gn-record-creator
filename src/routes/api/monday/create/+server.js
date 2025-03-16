import mondayServer from '$lib/api/monday.server';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const data = await request.json();
	const existingEntry = await mondayServer.getItemById(data.id);
	if (existingEntry) {
		// console.log(existingEntry)
		// console.log("ALREADY EXISTS")
		const res = await mondayServer.updateItem(existingEntry.id, data.responses)
		console.log(res)
		return new Response("UPDATED");
	}

	console.log("NEW ENTRY")
	const res = await mondayServer.createItem(data.id, data.responses);
	return new Response("NEW ENTRY");
}
