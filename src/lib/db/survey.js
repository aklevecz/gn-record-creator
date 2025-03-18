/** @param {import('@cloudflare/workers-types').D1Database} db */
const dbSurvey = (db) => {
	const tableName = 'gn_request_form';
	return {
		/** @param {*} id @param {*} responses */
		upsert: async (id, responses) => {
			const keys = Object.keys(responses);
			const values = Object.values(responses);

			const updatePairs = keys.map((key) => `${key} = ?`).join(',');

			const insertColumns = ['id', ...keys].join(',');
			const insertPlaceholders = ['?', ...keys.map(() => '?')].join(',');

			await db
				.prepare(
					`INSERT INTO ${tableName} (${insertColumns}) 
						 VALUES (${insertPlaceholders})
						 ON CONFLICT(id) DO UPDATE SET 
						 ${updatePairs}`
				)
				.bind(id, ...values, ...values)
				.run();
		},
		getAll: async () => {
			return db.prepare(`SELECT * FROM ${tableName}`).all();
		},
		/**
		 * @param {string} id
		 * @returns {Promise<* | null>}
		 */
		async get(id) {
			return db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).bind(id).first();
		}
	};
};

export default dbSurvey;
