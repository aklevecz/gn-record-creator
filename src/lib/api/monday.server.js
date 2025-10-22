import { MONDAY_API_TOKEN } from '$env/static/private';
import { idToValues } from '$lib/monday';
import {
    formFields,
    // intakeFormFields,
    intakeFormGroupTitleToId,
    keyToId
} from '$lib/monday/formFields';

const YAYTSO_BOARD_ID = 8703967457;
const RECORD_SETUP_BOARD_ID = 8705909367;
export const DEAL_TRACKER_BOARD_ID = 6253075642;
export const NEW_LEADS_BOARD = 9015288436;

const GROUP_ID = 'topics';

const idToKey = Object.fromEntries(Object.entries(keyToId).map(([key, value]) => [value, key]));
const mondayServerApi = () => {
    /**
     * @param {string} query
     * @param {Record<string, any>} variables
     */
    async function mondayFetch(query, variables = {}) {
        const endpoint = 'https://api.monday.com/v2';

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: MONDAY_API_TOKEN
            },
            body: JSON.stringify({
                query,
                variables
            })
        });
        if (!res.ok) {
            const error = await res.text();
            console.log(`Monday: Error: ${JSON.stringify(error)}`);
            throw new Error('Monday: Error');
        }
        const data = await res.json();
        return data;
    }

    const endpoint = 'https://api.monday.com/v2';

    return {
        getBoardById: async (id = NEW_LEADS_BOARD) => {
            const query = /* GraphQL */ ` query { boards(ids: ${id}) { id name columns { id title type } items_page(limit: 500) { items { id name column_values { column { id title type } text value } group { id title } } } } } `;

            return mondayFetch(query);
        },
        getBoards: async () => {
            const query = /* GraphQL */ `
                query {
                    boards(limit: 500) {
                        id
                        name
                        columns {
                            id
                            title
                            type
                            settings_str
                        }
                    }
                }
            `;

            return mondayFetch(query);
        },

        /** @param {string | number} id */
        getItemById: async (id) => {
            const query = /* GraphQL */ `query { items (ids: [${id}]) { name column_values { column { id title} id type value } } }`;

            return mondayFetch(query);
        },
        /**
         * Get all items from a board
         * @param {string} id - The board ID to get items from
         * @param {number} [boardId] - The board ID to get items from (defaults to RECORD_SETUP_BOARD_ID)
         * @returns {Promise<any>} - The query result containing all items
         */
        getPageItemById: async (id, boardId = NEW_LEADS_BOARD) => {
            const query = /* GraphQL */ `query { boards(ids: ${boardId}) { items_page (query_params: {rules: [{compare_value: "${id}", column_id: "name", operator: any_of}]}) { items { id name column_values { id type value } } } } }`;

            return mondayFetch(query);
        },
        /**
         * Query items by name
         * @param {string} name - The name to search for
         * @param {number} [boardId] - The board ID to get items from (defaults to NEW_LEADS_BOARD)
         * @returns {Promise<any>} - The query result containing the items
         */
        getItemsByName: async (name, boardId = NEW_LEADS_BOARD) => {
            const query = /* GraphQL */ `query { boards(ids: ${boardId}) { items_page(limit: 10, query_params: { rules: [{ column_id: "name", compare_value: ["${name}"], operator: contains }], operator: and }) { cursor items { id name column_values { id type value text column { id title type } } group { id title } } } } }`;

            return mondayFetch(query);
        },
        /** @param {string} itemName @param {string} formId @param {Record<string, string>} values */
        createItem: async (itemName, formId, values, boardId = NEW_LEADS_BOARD, groupId = intakeFormGroupTitleToId['Intake Form']) => {
            try {
                /** @type {Record<string, any>} */
                let idValues = idToValues(values);
                console.log(`Create item: ${itemName} with values: ${JSON.stringify(idValues)}`);
                // Add Status: New -- MAY NEED TO CHECK IF THIS SHOULD BE SUBMITTED IN THE EVENT THAT THEY SOMEHOW DONT UPDATE MONDAY UNTIL SUBMITTING THE FORM?
                idValues[formFields.status.id] = { index: formFields.status.options?.find((option) => option.value === 'new')?.index };
                // idValues[intakeFormFields.status.id] = { index: intakeFormFields.status.options.new };
                // Add Create Date
                idValues[formFields.create_date.id] = { date: new Date().toISOString().split('T')[0] };
                idValues[formFields.form_id.id] = formId
                // idValues[intakeFormFields.create_date.id] = { date: new Date().toISOString().split('T')[0] };
                // Add Source: Google Search for testing -- This is part of the survey now
                // idValues[intakeFormFields.source.id] = { index: intakeFormFields.source.options.google_search };

                const valuesStrings = JSON.stringify(JSON.stringify(idValues));
                console.log(`board id: ${boardId}, group id: ${groupId}, item name: ${itemName}, column values: ${valuesStrings}`);
                const query = /* GraphQL */ `
                    mutation {
                        create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "${itemName}", column_values: ${valuesStrings}) {
                            id
                        }
                    }
                    `;

                return mondayFetch(query);
            } catch (e) {
                console.error('Error in createItem:', e);
                throw e;
            }
        },
        /** @param {string} id @param {string} formId @param {Record<string, string>} values */
        updateItem: async (id, formId, values, boardId = NEW_LEADS_BOARD) => {
            try {
                /** @type {Record<string, any>} */
                const idValues = idToValues(values);
                console.log(`Update item: ${id} with values: ${JSON.stringify(idValues)}`);
                const firstName = values.contact_first_name || 'No first name';
                const lastName = values.contact_last_name || 'No last name';

                idValues.name = firstName + ' ' + lastName;
                idValues[formFields.form_id.id] = formId
                // idValues[intakeFormFields.updated_at.id] = { date: new Date().toISOString().split('T')[0] };
                idValues[formFields.updated_at.id] = { date: new Date().toISOString().split('T')[0] };

                const valueStrings = JSON.stringify(JSON.stringify(idValues));
                console.log(`board id: ${boardId}, item id: ${id}, column values: ${valueStrings}`);
                let query = /* GraphQL */ `mutation { change_multiple_column_values (item_id: ${id}, board_id: ${boardId}, column_values: ${valueStrings}) { id } }`;
                return mondayFetch(query);
            } catch (e) {
                // this probably wont catch because the response is returned
                console.log('Error updating item');
                console.log(e);
            }
        },
        queryDropdowns: async () => {
            const query = /* GraphQL */ `
                query {
                    items(ids: [8901154398]) {
                        column_values {
                            ... on DropdownValue {
                                values {
                                    id
                                }
                                column {
                                    id
                                    title
                                }
                            }
                        }
                    }
                }
            `;

            return mondayFetch(query);
        },
        getBoardColumnInfo: async (boardId = NEW_LEADS_BOARD) => {
            const query = /* GraphQL */ `query { boards(ids: [${boardId}]) { columns { id title type settings_str } } }`;

            return mondayFetch(query);
        },
        /**
         * Check if a Monday item has submitted status
         * @param {string | number} mondayId - The Monday item ID
         * @returns {Promise<{success: boolean, data?: {isSubmitted: boolean, currentStatus: string, mondayId: string, lastChecked: string}, error?: string}>}
         */
        getSubmittedStatus: async (mondayId) => {
            try {
                const response = await mondayFetch(
                    /* GraphQL */ `query { items(ids: [${mondayId}]) { id name column_values { column { id title type } id type value text } } }`
                );

                if (!response.data?.items?.length) {
                    return {
                        success: false,
                        error: 'Item not found'
                    };
                }

                const item = response.data.items[0];
                const submittedColumn = item.column_values.find(cv => cv.column.id === formFields.submitted.mondayId);

                if (!submittedColumn) {
                    return {
                        success: false,
                        error: 'Submitted column not found'
                    };
                }

                // Use the same approach as admin panel: prioritize text over value
                const currentStatus = submittedColumn.text || submittedColumn.value || 'Unknown';
                
                // Check if status is "Submitted" by comparing the text directly
                const isSubmitted = currentStatus === 'Submitted';

                return {
                    success: true,
                    data: {
                        isSubmitted,
                        currentStatus,
                        mondayId: mondayId.toString(),
                        lastChecked: new Date().toISOString()
                    }
                };
            } catch (error) {
                console.log('Error checking submitted status:', error);
                return {
                    success: false,
                    error: 'API error'
                };
            }
        }
    };
};

export default mondayServerApi();
