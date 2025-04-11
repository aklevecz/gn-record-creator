import { MONDAY_API_TOKEN } from '$env/static/private';
import { idToValues } from '$lib/monday';
import { dealTrackerColumnIdToTitleAndType, dealTrackerGroupTitleToId, keyToId } from '$lib/monday/mappers';
import { questions } from '$lib/survey-data-model';

const YAYTSO_BOARD_ID = 8703967457;
const RECORD_SETUP_BOARD_ID = 8705909367;
export const DEAL_TRACKER_BOARD_ID = 6253075642;

const GROUP_ID = 'topics';



const idToKey = Object.fromEntries(Object.entries(keyToId).map(([key, value]) => [value, key]));
const mondayServerApi = () => {
    const endpoint = 'https://api.monday.com/v2';

    return {
        getBoardById: async (id = DEAL_TRACKER_BOARD_ID) => {
            const query = `
                query {
                    boards(ids: ${id}) {
                        id
                        name
                        columns {
                            id
                            title
                            type
                        }
                        items_page(limit: 500) {
                            items {
                                id
                                name
                                column_values {
                                    column {
                                        id
                                        title
                                        type
                                    }
                                    text
                                    value
                                }
                                group {
                                    id
                                    title
                                }
                            }
                        }
                    }
                }
            `;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });
            if (!res.ok) {
                const error = await res.text();
                console.log(`Monday: Error getting board: ${JSON.stringify(error)}`);
                throw new Error('Monday: Error getting board');
            }
            const data = await res.json();
            return data;
        },
        getBoards: async () => {
            const query = `
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

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });
            if (!res.ok) {
                const error = await res.text();
                console.log(`Monday: Error getting boards: ${JSON.stringify(error)}`);
                throw new Error('Monday: Error getting boards');
            }
            const data = await res.json();
            return data;
        },
        /** @param {string} id @param {Record<string, string>} values */
        createItem: async (id, values, boardId = DEAL_TRACKER_BOARD_ID, groupId = dealTrackerGroupTitleToId.Tests) => {
            // const query = `mutation { create_item(board_id: ${boardId}, column_values: ${JSON.stringify(data)}) { id } }`;
            // const query = `mutation{ create_item (board_id: 8703967457, item_name: "New Item"){ id name } } `;
            let idValues = Object.entries(values).reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [keyToId[key]]: value
                }),
                {}
            );
            // const item_name = idValues['project_name']
            console.log(idValues);
            return;
            // idValues = {short_text8__1: 'Api Test'}
            const valuesStrings = JSON.stringify(JSON.stringify(idValues));
            const query = /* GraphQL */ `
                    mutation {
                        create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "${id}", column_values: ${valuesStrings}) {
                            id
                        }
                    }
                    `;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });
            if (!res.ok) {
                const error = await res.text();
                console.log(`Monday: Error creating item: ${JSON.stringify(error)}`);
                throw new Error('Monday: Error getting boards');
            }
            console.log(res);
            const data = await res.json();
            console.log(data);
            return data;
        },
        /** @param {string | number} id */
        getItemById: async (id) => {
            const query = `query {
  items (ids: [${id}]) {
    name
    column_values {
      column {
      id
      title}
      id
      type
      value
    }
  }
}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });

            const data = await res.json();
            return data;
        },
        /**
         * Get all items from a board
         * @param {string} id - The board ID to get items from
         * @param {number} [boardId] - The board ID to get items from (defaults to RECORD_SETUP_BOARD_ID)
         * @returns {Promise<any>} - The query result containing all items
         */
        getPageItemById: async (id, boardId = DEAL_TRACKER_BOARD_ID) => {
            const query = `query {
  boards(ids: ${boardId}) {
        items_page (query_params: {rules: [{compare_value: "${id}", column_id: "name", operator: any_of}]}) {

	items {
      id
      name
      column_values {
        id
		type
		value
      }
    }
		}
  }
}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });

            const data = await res.json();
            return data.data.boards[0].items_page.items[0];
        },
        /** @param {string} id @param {Record<string, string>} values */
        updateItem: async (id, values, boardId = DEAL_TRACKER_BOARD_ID) => {
            const idValues = idToValues(values);
            const valueStrings = JSON.stringify(JSON.stringify(idValues));
            let query = `mutation { change_multiple_column_values (item_id: ${id}, board_id: ${boardId}, column_values: ${valueStrings}) { id } }`;
            // "{\"status\": {\"index\": 1},\"date4\": {\"date\":\"2021-01-01\"}, \"person\" : {\"personsAndTeams\":[{\"id\":9603417,\"kind\":\"person\"}]}}"
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });
            const data = await res.json();
            return data;
        },
        queryDropdowns: async () => {
            const query = `query {
  items (ids:[8901154398]) {
    column_values {
      ... on DropdownValue {
        values {
        id}
        column{
        id title}
      }
    }
  }
}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });

            const data = await res.json();
            return data;
        },
        getBoardColumnInfo: async (boardId = DEAL_TRACKER_BOARD_ID) => {
            const query = `query {
  boards(ids: [${boardId}]) {
    columns {
      id
      title
      type
      settings_str
    }
  }
}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: MONDAY_API_TOKEN
                },
                body: JSON.stringify({
                    query
                })
            });

            const data = await res.json();
            return data;
        }
    };
};

export default mondayServerApi();
