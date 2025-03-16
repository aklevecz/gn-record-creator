import mondayServer from '$lib/api/monday.server';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const data = await request.json();
	console.log(data);
    const res = await mondayServer.createItem(data.id, data.responses);
    console.log(res)
	return new Response();
}
