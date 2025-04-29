import mondayServer from '$lib/api/monday.server';
import errors from '$lib/errors';
import logger from '$lib/logging';
import { error, json } from '@sveltejs/kit';

// NEED TO ADD ERROR HANDLING
/** @param {Record<string, any>} obj */
function cleanEmptyValues(obj) {
	/** @type {Record<string, any>} */
	const result = {};
	
	for (const key in obj) {
	  if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
		result[key] = obj[key];
	  }
	}
	
	return result;
  }
/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
    /** @type {*} */
    const ctx = platform?.context;
    const logging = logger(ctx);
    try {
        const data = await request.json();
        // Is using project name dangerous?
        const projectName = data.responses.project_name;
		const responses = cleanEmptyValues(data.responses)
        let mondayId = data.mondayId;
        let existingEntry = null;
        if (mondayId) {
            const existingEntryObject = await mondayServer.getItemById(mondayId);
            existingEntry = existingEntryObject.data.items[0];
        } else {
			// Collision potential-- maybe needs to check something besides project name or there needs to be another unique key driven by this side into monday
			// in theory a project will have a mondayId if it exists and not get here
            const existingEntries = await mondayServer.getPageItemById(projectName);
            /**
             * @typedef {*} MondayEntry
             */

			// Names could potential collide or be changed by good neighbor team members
            // existingEntry = existingEntries.data.boards[0].items_page.items.find((/** @type {MondayEntry} */ item) => item.name === data.id);
			existingEntry = existingEntries.data.boards[0].items_page.items[0]
            if (existingEntry) {
                mondayId = existingEntry.id;
            }
        }
        //BETTER CHECK NEEDED
        if (mondayId) {
            console.log(`Updating existing entry ${data.id} with id ${mondayId}`);
            console.log(`Entry ${data.id} already exists with id ${mondayId}`);
			logging.info(`Updating entry ${data.id}`);
            const mondayResponse = await mondayServer.updateItem(mondayId, responses);
            return json({ mondayId: mondayResponse.data.change_multiple_column_values.id });
        }
        logging.info(`Creating new entry ${data.id}`);
        console.log(`Creating new entry ${data.id}`);
        // return error(500, errors.UPDATE_MONDAY_FAILED);
        // const mondayResponse = await mondayServer.createItem(data.id, data.responses);
        const mondayResponse = await mondayServer.createItem(projectName, responses);
        return json({ mondayId: mondayResponse.data.create_item.id });
    } catch (e) {
        logging.error(`Error updating entry ${JSON.stringify(e)}`);
        console.log(e);
        return error(500, errors.UPDATE_MONDAY_FAILED);
    }
}
