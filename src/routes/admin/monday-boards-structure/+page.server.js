import mondayServer from '$lib/api/monday.server.js';
import logger from '$lib/logging';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	/** @type {*} */
	const ctx = platform?.context;
	const logging = logger(ctx);

	try {
		logging.info('Fetching all Monday.com boards info...');
		const boardsData = await mondayServer.getBoards();
		if (!boardsData || !boardsData.data || !boardsData.data.boards) {
			logging.error(`Failed to fetch or parse boards info from Monday.com. Response: ${JSON.stringify(boardsData)}`);
			throw error(500, 'Failed to fetch boards info');
		}

		const boards = boardsData.data.boards;
		
		logging.info(`Successfully fetched ${boards.length} boards.`);

		// Return the necessary data to the page
		return {
			boards: boards
		};
	} catch (e) {
		logging.error(`Error loading Monday Boards structure page: ${e}`);
		// Rethrow the error or handle it appropriately
		if (e instanceof Error && 'status' in e) {
			throw e; // Rethrow SvelteKit errors
		}
		throw error(500, 'An error occurred while fetching boards data.');
	}
}