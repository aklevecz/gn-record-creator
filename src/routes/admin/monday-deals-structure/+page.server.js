import mondayServer, {
	DEAL_TRACKER_BOARD_ID,
	dealTrackerGroupIdToTitle
} from '$lib/api/monday.server.js';
import logger from '$lib/logging';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	/** @type {*} */
	const ctx = platform?.context;
	const logging = logger(ctx);

	try {
		logging.info('Fetching Monday.com Deals Board column info...');
		const boardInfo = await mondayServer.getBoardColumnInfo(DEAL_TRACKER_BOARD_ID);

		if (!boardInfo || !boardInfo.data || !boardInfo.data.boards || !boardInfo.data.boards[0]) {
			logging.error(`Failed to fetch or parse board column info from Monday.com. Response: ${JSON.stringify(boardInfo)}`);
			throw error(500, 'Failed to fetch board column info');
		}

		const columns = boardInfo.data.boards[0].columns;
		logging.info(`Successfully fetched ${columns.length} columns.`);

		// Return the necessary data to the page
		return {
			columns: columns,
			groupTitles: dealTrackerGroupIdToTitle
		};
	} catch (e) {
		logging.error(`Error loading Monday Deals Board structure page: ${e}`);
		// Rethrow the error or handle it appropriately
		if (e instanceof Error && 'status' in e) {
			throw e; // Rethrow SvelteKit errors
		}
		throw error(500, 'An error occurred while fetching board data.');
	}
}