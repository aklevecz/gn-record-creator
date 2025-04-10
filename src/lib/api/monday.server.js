import { MONDAY_API_TOKEN } from '$env/static/private';

const YAYTSO_BOARD_ID = 8703967457;
const RECORD_SETUP_BOARD_ID = 8705909367;
export const DEAL_TRACKER_BOARD_ID = 6253075642;

const GROUP_ID = 'topics';

export const dealTrackerGroupIdToTitle = {
    topics: 'Discovery',
    closed: 'Quote Sent',
    new_group49013__1: 'Quote approved - Billing Codes, Costs and quantities to be added/finalized',
    new_group48974__1: 'Invoice finalized & ready for QB',
    new_group75371: 'WON, Deposit Received >> IN PRODUCTION',
    new_group54140__1: 'Promos / R&D',
    new_group84535__1: 'COMPLETED',
    new_group80748__1: 'LOST, Deal Fell Through',
    group_mknmfwkf: 'Bad timing',
    group_mknstj2d: 'Tests'
};

const dealTrackerGroupTitleToId = {
    Discovery: 'topics',
    'Quote Sent': 'closed',
    'Quote approved - Billing Codes, Costs and quantities to be added/finalized': 'new_group49013__1',
    'Invoice finalized & ready for QB': 'new_group48974__1',
    'WON, Deposit Received >> IN PRODUCTION': 'new_group75371',
    'Promos / R&D': 'new_group54140__1',
    COMPLETED: 'new_group84535__1',
    'LOST, Deal Fell Through': 'new_group80748__1',
    'Bad timing': 'group_mknmfwkf',
    Tests: 'group_mknstj2d'
};

const dealTrackerColumnTitleToObject = {
    '# of Test Pressings required?': {
        id: 'numbers50',
        type: 'numbers'
    },
    'Artist:': {
        id: 'artist',
        type: 'text'
    },
    'CAT/PROJ #': {
        id: 'short_text_1__1',
        type: 'text'
    },
    'Calc Roll Up Invoice': {
        id: 'subitems_formula',
        type: 'mirror'
    },
    'Close Date': {
        id: 'deal_close_date',
        type: 'date'
    },
    'Collation & Packing Notes': {
        id: 'long_text',
        type: 'long_text'
    },
    'Completed Date': {
        id: 'date_mkm2y4ea',
        type: 'date'
    },
    'Contact Email': {
        id: 'email__1',
        type: 'email'
    },
    'Contact Name:': {
        id: 'short_text8__1',
        type: 'text'
    },
    'Customer Contact': {
        id: 'deal_contact',
        type: 'board_relation'
    },
    'Deal Value (GN)': {
        id: 'formula5__1',
        type: 'formula'
    },
    'Deal creation date': {
        id: 'deal_creation_date',
        type: 'date'
    },
    'Deal length': {
        id: 'deal_length',
        type: 'formula'
    },
    'Depot Date': {
        id: 'date5',
        type: 'date'
    },
    'Expected Close Date': {
        id: 'color_mkny6etg',
        type: 'status'
    },
    'Final Quantity': {
        id: 'dup__of_total_discs__1',
        type: 'numbers'
    },
    'GN Income/Unit ($)': {
        id: 'formula_mkpbxm0k',
        type: 'formula'
    },
    'GN Invoice #': {
        id: 'text8__1',
        type: 'text'
    },
    'GN Margin': {
        id: 'formula9__1',
        type: 'formula'
    },
    'Invoice Value': {
        id: 'formula__1',
        type: 'formula'
    },
    InvoicePriority: {
        id: 'dup__of_quotecat__1',
        type: 'status'
    },
    'Label:': {
        id: 'text9',
        type: 'text'
    },
    'Lacquers?': {
        id: 'status8',
        type: 'status'
    },
    'Last Check In': {
        id: 'date__1',
        type: 'date'
    },
    'Last Follow Up': {
        id: 'date_mknhhrwc',
        type: 'date'
    },
    Leads: {
        id: 'board_relation_mkp7y0rc',
        type: 'board_relation'
    },
    Notes: {
        id: 'text_mknh1fek',
        type: 'text'
    },
    Owner: {
        id: 'deal_owner',
        type: 'people'
    },
    Packaging: {
        id: 'status44',
        type: 'status'
    },
    'Payment Terms': {
        id: 'status71__1',
        type: 'status'
    },
    Phone: {
        id: 'phone__1',
        type: 'phone'
    },
    'QC Issues': {
        id: 'status1__1',
        type: 'status'
    },
    'Quote #': {
        id: 'text__1',
        type: 'text'
    },
    'Quote Sent Date': {
        id: 'date3__1',
        type: 'date'
    },
    QuoteCAT: {
        id: 'status6__1',
        type: 'status'
    },
    'Record: #/Set': {
        id: '__of_records_set',
        type: 'status'
    },
    'Record: Format / RPM': {
        id: 'single_select_3',
        type: 'status'
    },
    'Release Date': {
        id: 'date',
        type: 'date'
    },
    'Req Date INVOICE': {
        id: 'date6__1',
        type: 'date'
    },
    'Sales Team': {
        id: 'people__1',
        type: 'people'
    },
    'Ship Finished Goods': {
        id: 'location0',
        type: 'location'
    },
    'Should GN handle the shipping logistics of the finished goods?': {
        id: 'single_select9__1',
        type: 'status'
    },
    'Shrink Wrap': {
        id: 'single_select_2',
        type: 'status'
    },
    Sleeve: {
        id: 'single_select_1',
        type: 'status'
    },
    'Special Notes:': {
        id: 'single_select5',
        type: 'status'
    },
    'Special Request/Notes:': {
        id: 'long_text2',
        type: 'long_text'
    },
    Stage: {
        id: 'deal_stage',
        type: 'status'
    },
    'Stampers?': {
        id: 'status06',
        type: 'status'
    },
    Status: {
        id: 'color_mknhgew1',
        type: 'status'
    },
    'Subitem Rollup Deal Value': {
        id: 'subitems_gn_revenue__1',
        type: 'mirror'
    },
    Tasks: {
        id: 'subitems',
        type: 'subtasks'
    },
    'Test Pressing Destinations': {
        id: 'numbers4__1',
        type: 'numbers'
    },
    'Title:': {
        id: 'text6',
        type: 'text'
    },
    'Total Discs': {
        id: 'numbers1__1',
        type: 'numbers'
    },
    'Total Units': {
        id: 'number4__1',
        type: 'numbers'
    },
    'WON Date': {
        id: 'date1__1',
        type: 'date'
    },
    'What color(s) would you like your records to be?': {
        id: 'multi_select__1',
        type: 'dropdown'
    }
};

const dealTrackerColumnTitleToId = {
    '# of Test Pressings required?': 'numbers50',
    'Artist:': 'artist',
    'CAT/PROJ #': 'short_text_1__1',
    'Calc Roll Up Invoice': 'subitems_formula',
    'Collation & Packing Notes': 'long_text',
    'Completed Date': 'date_mkm2y4ea',
    'Contact Email': 'email__1',
    'Contact Name:': 'short_text8__1',
    'Customer Contact': 'deal_contact',
    'Deal Value (GN)': 'formula5__1',
    'Deal creation date': 'deal_creation_date',
    'Deal length': 'deal_length',
    'Depot Date': 'date5',
    'Expected Close Date': 'color_mkny6etg',
    'Final Quantity': 'dup__of_total_discs__1',
    'GN Income/Unit ($)': 'formula_mkpbxm0k',
    'GN Invoice #': 'text8__1',
    'GN Margin': 'formula9__1',
    'Invoice Value': 'formula__1',
    InvoicePriority: 'dup__of_quotecat__1',
    'Label:': 'text9',
    'Lacquers?': 'status8',
    'Last Check In': 'date__1',
    'Last Follow Up': 'date_mknhhrwc',
    Leads: 'board_relation_mkp7y0rc',
    Notes: 'text_mknh1fek',
    Owner: 'deal_owner',
    Packaging: 'status44',
    'Payment Terms': 'status71__1',
    Phone: 'phone__1',
    'QC Issues': 'status1__1',
    'Quote #': 'text__1',
    'Quote Sent Date': 'date3__1',
    QuoteCAT: 'status6__1',
    'Record: #/Set': '__of_records_set',
    'Record: Format / RPM': 'single_select_3',
    'Release Date': 'date',
    'Req Date INVOICE': 'date6__1',
    'Sales Team': 'people__1',
    'Ship Finished Goods': 'location0',
    'Should GN handle the shipping logistics of the finished goods?': 'single_select9__1',
    'Shrink Wrap': 'single_select_2',
    Sleeve: 'single_select_1',
    'Special Notes:': 'single_select5',
    'Special Request/Notes:': 'long_text2',
    Stage: 'deal_stage',
    'Stampers?': 'status06',
    Status: 'color_mknhgew1',
    'Subitem Rollup Deal Value': 'subitems_gn_revenue__1',
    Tasks: 'subitems',
    'Test Pressing Destinations': 'numbers4__1',
    'Title:': 'text6',
    'Total Discs': 'numbers1__1',
    'Total Units': 'number4__1',
    'WON Date': 'date1__1',
    'What color(s) would you like your records to be?': 'multi_select__1',
    'Close Date': 'deal_close_date'
};

/** @type {Record<string, string>} */
const keyToId = {
    project_name: 'text_mkp34nzh',
    contact_name: 'text_mkp3fsjg',
    contact_email: 'text_mkp3bvy2',
    phone: 'phone_mkp3e0fz',
    label: 'text_mkp3atpm',
    artist: 'text_mkp3w9tc',
    catalog_number: 'text_mkp3qwkv',
    release_date: 'text_mkp3py10',
    depot_date: 'text_mkp3f56v',
    shipping_address: 'text_mkp3ch9a',
    shipping_logistics: 'text_mkp3gft7',
    total_units: 'text_mkp3g5p7',
    records_per_set: 'text_mkp3xj65',
    record_format: 'text_mkp37qak',
    record_color: 'text_mkp3fdcb',
    lacquers: 'text_mkp3g925',
    metalwork: 'text_mkp319zx',
    test_prints: 'text_mkp375bp',
    packaging: 'text_mkp3gb0e',
    notes: 'text_mkp3vvp7',
    status: 'text_mkp5wwe5'
};

const idToKey = Object.fromEntries(Object.entries(keyToId).map(([key, value]) => [value, key]));
const mondayServerApi = () => {
    const endpoint = 'https://api.monday.com/v2';

    return {
        getBoardById: async (id = DEAL_TRACKER_BOARD_ID) => {
            const query = `
                query {
                    boards (ids: ${id}) {
                        id
                        name
                        items_page(limit:500) {
                            items {
                                id
                                name
                                group {
                                id
                                title}
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
        createItem: async (id, values) => {
            // const query = `mutation { create_item(board_id: ${boardId}, column_values: ${JSON.stringify(data)}) { id } }`;
            // const query = `mutation{ create_item (board_id: 8703967457, item_name: "New Item"){ id name } } `;
            const idValues = Object.entries(values).reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [keyToId[key]]: value
                }),
                {}
            );
            const valuesStrings = JSON.stringify(JSON.stringify(idValues));
            const query = `mutation {
  create_item (board_id: ${RECORD_SETUP_BOARD_ID}, group_id: "${GROUP_ID}", item_name: "${id}", column_values: ${valuesStrings}) {
    id
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
            if (!res.ok) {
                const error = await res.text();
                console.log(`Monday: Error creating item: ${JSON.stringify(error)}`);
                throw new Error('Monday: Error getting boards');
            }
            const data = await res.json();
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
        getPageItemById: async (id, boardId = RECORD_SETUP_BOARD_ID) => {
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
        updateItem: async (id, values) => {
            const idValues = Object.entries(values).reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [keyToId[key]]: value
                }),
                {}
            );
            const valueStrings = JSON.stringify(JSON.stringify(idValues));
            let query = `mutation { change_multiple_column_values (item_id: ${id}, board_id: ${RECORD_SETUP_BOARD_ID}, column_values: ${valueStrings}) { id } }`;
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
}`

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
    }
};

export default mondayServerApi();
