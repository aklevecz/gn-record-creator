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

// CREATE & UPDATE
/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
    /** @type {*} */
    const ctx = platform?.context;
    const logging = logger(ctx);
    try {
        const data = await request.json();
        // const title = data.responses.title;
        const mondayName = data.responses.contact_first_name + ' ' + data.responses.contact_last_name;
        const responses = cleanEmptyValues(data.responses);
        let mondayId = data.mondayId;
        console.log(`mondayId: ${mondayId}`);
        if (!mondayName) {
            console.log('User has not filled in their name yet');
            return error(400, errors.UPDATE_SURVEY_FAILED_NONAME);
        }

        // let existingEntry = null;

        // NOT DOING ANYTHING
        // Checking for an existing Monday entry -- THIS ISNT DOING ANYTHING
        // if (mondayId) {
        //     // What is this for if it checks it later
        //     const existingEntryObject = await mondayServer.getItemById(mondayId);
        //     existingEntry = existingEntryObject.data.items[0];
        // } else {
        //     // Collision potential -- maybe needs to check something besides project name or there needs to be another unique key driven by this side into monday
        //     // in theory a project will have a mondayId if it exists and not get here
        //     const existingEntries = await mondayServer.getPageItemById(mondayName);

        //     // Names could potential collide or be changed by good neighbor team members
        //     // existingEntry = existingEntries.data.boards[0].items_page.items.find((/** @type {MondayEntry} */ item) => item.name === data.id);
        //     existingEntry = existingEntries.data.boards[0].items_page.items[0];
        //     if (existingEntry) {
        //         mondayId = existingEntry.id;
        //     }
        // }
        // END NOT DOING ANYTHING
        // If Monday entry exists
        if (mondayId) {
            logging.info(`Updating entry ${data.id}`);
            console.log(`Updating entry ${data.id}`);
            const mondayResponse = await mondayServer.updateItem(mondayId, responses);
            return json({ mondayId: mondayResponse.data.change_multiple_column_values.id });
        }
        logging.info(`Creating new entry ${data.id}`);
        console.log(`Creating new entry ${data.id}`);
        const mondayResponse = await mondayServer.createItem(mondayName, responses);
        return json({ mondayId: mondayResponse.data.create_item.id });
    } catch (e) {
        logging.error(`Error updating entry ${JSON.stringify(e)}`);
        console.log(`Error updating entry ${JSON.stringify(e)}`);
        return error(500, errors.UPDATE_MONDAY_FAILED);
    }
}
