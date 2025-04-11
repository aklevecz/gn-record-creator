import mondayServer from '$lib/api/monday.server.js';
import logger from '$lib/logging';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ platform, params }) {
	/** @type {*} */
	const ctx = platform?.context;
	const logging = logger(ctx);

	const boardId = params.boardId;
	
	try {
		logging.info(`Fetching Monday.com board data for board ID: ${boardId}...`);
		const boardData = await mondayServer.getBoardById(Number(boardId));

		if (!boardData || !boardData.data || !boardData.data.boards || !boardData.data.boards[0]) {
			logging.error(`Failed to fetch or parse board data from Monday.com for board ID: ${boardId}. Response: ${JSON.stringify(boardData)}`);
			throw error(500, 'Failed to fetch board data');
		}

		const board = boardData.data.boards[0];
		logging.info(`Successfully fetched board data for board ID: ${boardId}.`);

		return {
			board: board
		};
	} catch (e) {
		logging.error(`Error loading Monday Board data page for board ID ${boardId}: ${e}`);
		// Rethrow the error or handle it appropriately
		if (e instanceof Error && 'status' in e) {
			throw e; // Rethrow SvelteKit errors
		}
		throw error(500, 'An error occurred while fetching board data.');
	}
}