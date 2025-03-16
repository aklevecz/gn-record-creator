import { MONDAY_API_TOKEN } from '$env/static/private';

const YAYTSO_BOARD_ID = 8703967457;
const RECORD_SETUP_BOARD_ID = 8705909367;

const GROUP_ID = 'topics';

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
	notes: 'text_mkp3vvp7'
};

const idToKey = Object.fromEntries(Object.entries(keyToId).map(([key, value]) => [value, key]));
const mondayServerApi = () => {
	const endpoint = 'https://api.monday.com/v2';

	return {
		getBoards: async () => {
			const query = `query { boards { columns { id title type } } }`;

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

			console.log(query);
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
			console.log(await res.text());
			// const data = await res.json();
			// return data;
		},
		/**
		 * Get all items from a board
		 * @param {string} id - The board ID to get items from
		 * @param {number} [boardId] - The board ID to get items from (defaults to RECORD_SETUP_BOARD_ID)
		 * @returns {Promise<any>} - The query result containing all items
		 */
		getItemById: async (id, boardId = RECORD_SETUP_BOARD_ID) => {
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
		}
	};
};

export default mondayServerApi();
