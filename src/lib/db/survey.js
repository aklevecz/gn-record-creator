// ID IS PROJECT_ID

// is this more the Project api?

/** @param {import('@cloudflare/workers-types').D1Database} db */
const dbSurvey = (db) => {
	const tableName = 'gn_request_form';
	return {
		/** @param {*} id @param {*} responses */
		upsert: async (id, responses) => {
			const keys = Object.keys(responses);
			const values = Object.values(responses);

			// Build update pairs, protecting certain fields from being overwritten
			const updatePairs = keys
				.map((key) => {
					if (key === 'submitted') {
						// Only update submitted if it's not already "Submitted"
						return `${key} = CASE WHEN ${tableName}.submitted = 'Submitted' THEN ${tableName}.submitted ELSE ? END`;
					}
					if (key === 'monday_id') {
						// Only update monday_id if current value is empty/null
						return `${key} = CASE WHEN (${tableName}.monday_id IS NULL OR ${tableName}.monday_id = '') THEN ? ELSE ${tableName}.monday_id END`;
					}
					return `${key} = ?`;
				})
				.join(',');

			const insertColumns = ['id', ...keys].join(',');
			const insertPlaceholders = ['?', ...keys.map(() => '?')].join(',');

			await db
				.prepare(
					`INSERT INTO ${tableName} (${insertColumns})
						 VALUES (${insertPlaceholders})
						 ON CONFLICT(id) DO UPDATE SET
						 ${updatePairs}`
				)
				// Needs to destructure values twice for the insert statement and then the update statement
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
		},
		/** @param {string} sessionId */
		async getAllBySessionId(sessionId) {
			return db.prepare(`SELECT * FROM ${tableName} WHERE session = ?`).bind(sessionId).all();
		},
		/** @param {string} projectId */
		async deleteByProjectId(projectId) {
			return db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(projectId).run();
		},
		/** @param {string} id */
		async delete(id) {
			return db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
		}
	};
};

export default dbSurvey;
