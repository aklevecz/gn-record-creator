import mondayServer, { DEAL_TRACKER_BOARD_ID } from '$lib/api/monday.server';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const res = await mondayServer.getBoardById()
	// const item = await mondayServer.getItemById('8901154398')
	// const dropdowns = await mondayServer.queryDropdowns()
	// const res = await mondayServer.getBoardColumnInfo()
	// console.log(res);
	return json(res)
}
