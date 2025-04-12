import { MONDAY_API_TOKEN } from '$env/static/private';
import { idToValues } from '$lib/monday';
import { dealTrackerGroupTitleToId, keyToId } from '$lib/monday/mappers';

const YAYTSO_BOARD_ID = 8703967457;
const RECORD_SETUP_BOARD_ID = 8705909367;
export const DEAL_TRACKER_BOARD_ID = 6253075642;

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
        getBoardById: async (id = DEAL_TRACKER_BOARD_ID) => {
            const query = /* GraphQL */ ` query { boards(ids: ${id}) { id name columns { id title type } items_page(limit: 500) { items { id name column_values { column { id title type } text value } group { id title } } } } } `;

            return mondayFetch(query);
        },
        getBoards: async () => {
            const query = /* GraphQL */ ` query { boards(limit: 500) { id name columns { id title type settings_str } } } `;

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
        getPageItemById: async (id, boardId = DEAL_TRACKER_BOARD_ID) => {
            const query = /* GraphQL */`query { boards(ids: ${boardId}) { items_page (query_params: {rules: [{compare_value: "${id}", column_id: "name", operator: any_of}]}) { items { id name column_values { id type value } } } } }`;

            return mondayFetch(query);
        },
        /**
         * Query items by name
         * @param {string} name - The name to search for
         * @param {number} [boardId] - The board ID to get items from (defaults to DEAL_TRACKER_BOARD_ID)
         * @returns {Promise<any>} - The query result containing the items
         */
        getItemsByName: async (name, boardId = DEAL_TRACKER_BOARD_ID) => {
            const query = /* GraphQL */ `query { boards(ids: ${boardId}) { items_page(limit: 10, query_params: { rules: [{ column_id: "name", compare_value: ["${name}"], operator: contains }], operator: and }) { cursor items { id name column_values { id type value text column { id title type } } group { id title } } } } }`;

            return mondayFetch(query);
        },
        /** @param {string} id @param {Record<string, string>} values */
        createItem: async (id, values, boardId = DEAL_TRACKER_BOARD_ID, groupId = dealTrackerGroupTitleToId.Tests) => {
            // const query = `mutation { create_item(board_id: ${boardId}, column_values: ${JSON.stringify(data)}) { id } }`;
            // const query = `mutation{ create_item (board_id: 8703967457, item_name: "New Item"){ id name } } `;
            let idValues = idToValues(values);
            // const item_name = idValues['project_name']
            // idValues = {short_text8__1: 'Api Test'}
            const valuesStrings = JSON.stringify(JSON.stringify(idValues));
            const query = /* GraphQL */ `
                    mutation {
                        create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "${id}", column_values: ${valuesStrings}) {
                            id
                        }
                    }
                    `;

            return mondayFetch(query);
        },
        /** @param {string} id @param {Record<string, string>} values */
        updateItem: async (id, values, boardId = DEAL_TRACKER_BOARD_ID) => {
            const idValues = idToValues(values);
            const valueStrings = JSON.stringify(JSON.stringify(idValues));
            let query = /* GraphQL */ `mutation { change_multiple_column_values (item_id: ${id}, board_id: ${boardId}, column_values: ${valueStrings}) { id } }`;
            return mondayFetch(query);
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
        getBoardColumnInfo: async (boardId = DEAL_TRACKER_BOARD_ID) => {
            const query = /* GraphQL */ `query { boards(ids: [${boardId}]) { columns { id title type settings_str } } }`;

            return mondayFetch(query);
        }
    };
};

export default mondayServerApi();
