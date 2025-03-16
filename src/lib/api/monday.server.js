import { MONDAY_API_TOKEN } from '$env/static/private';

const YAYTSO_BOARD_ID = 8703967457;
const RECORD_SETUP_BOARD_ID = 8705909367;

/** @type {Record<string, string>} */
const keyToId = {
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
				}), {}
			)
			console.log(idValues);
			const valuesStrings = JSON.stringify(JSON.stringify(idValues));
			const query = `mutation {
  create_item (board_id: ${RECORD_SETUP_BOARD_ID}, group_id: "topics", item_name: "${id}", column_values: ${valuesStrings}) {
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
		}
	};
};

export default mondayServerApi();
