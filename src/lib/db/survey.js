import { getAll } from 'three/examples/jsm/libs/tween.module.js';

/** @param {import('@cloudflare/workers-types').D1Database} db */
const dbSurvey = (db) => {
	const tableName = 'gn_survey';
	return {
		/** @param {*} responses */
		save: async (responses) => {
            const id = crypto.randomUUID();
			const keys = Object.keys(responses);
            const values = Object.values(responses);
			await db
				.prepare(`INSERT INTO ${tableName} (id, ${keys.join(',')}) VALUES (?,${keys.map(() => '?').join(',')})`)
				.bind(id, ...values)
				.run();
		},
        getAll: async () => {
            return db.prepare(`SELECT * FROM ${tableName}`).all();
        },
		/**
		 * @param {string} id
		 * @returns {Promise<* | null>}
		 */
		async getFreebee(id) {
			return db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).bind(id).first();
		},
		/** @param {string} id @param {{key:string, value:string | number}[]} newValues */
		async updateFreebee(id, newValues) {
			const existingFreebee = await this.getFreebee(id);
			if (!existingFreebee) {
				console.error('Freebee does not exist');
				return null;
			}
			try {
				await db
					.prepare(`UPDATE ${tableName} SET ${newValues.map((o) => `${o.key} ='${o.value}'`)}`)
					.run();
			} catch (e) {
				console.log(e);
				console.error(`Failed to update ${id} with values ${JSON.stringify(newValues)}`);
			}
		}
	};
};

export default dbSurvey;
