import mondayServer from '$lib/api/monday.server.js';
import logger from '$lib/logging';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	/** @type {*} */
	const ctx = platform?.context;
	const logging = logger(ctx);
	const { boardId } = params;

	try {
		logging.info(`Fetching Monday.com board info for board ID: ${boardId}...`);
		const boardsData = await mondayServer.getBoards();
		
		if (!boardsData || !boardsData.data || !boardsData.data.boards) {
			logging.error(`Failed to fetch or parse boards info from Monday.com. Response: ${JSON.stringify(boardsData)}`);
			throw error(500, 'Failed to fetch boards info');
		}
		
		const boards = boardsData.data.boards;
		const board = boards.find(b => b.id === boardId);
		
		if (!board) {
			logging.error(`Board with ID ${boardId} not found`);
			throw error(404, `Board with ID ${boardId} not found`);
		}
		
		logging.info(`Successfully fetched board: ${board.name}`);

		// Return the necessary data to the page
		return {
			board: board,
			boardId: boardId
		};
	} catch (e) {
		logging.error(`Error loading Monday Board detail page for ID ${boardId}: ${e}`);
		// Rethrow the error or handle it appropriately
		if (e instanceof Error && 'status' in e) {
			throw e; // Rethrow SvelteKit errors
		}
		throw error(500, 'An error occurred while fetching board data.');
	}
}