const surveyApi = () => {
	const endpoints = {
		getById: 'api/survey',
		create: 'api/survey/create'
	};

	return {
		/** @param {string} id */
		async get(id) {
			try {
				const res = await fetch(`${endpoints.getById}/${id}`);
				const data = await res.json()
				return data
			} catch (e) {
				throw Error('Failed to fetch survey');
			}
		},
		/** @param {{id: string, responses: Record<string, string> }} data */
		create({ id, responses }) {
			return fetch(endpoints.create, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, responses })
			});
		}
	};
};

export default surveyApi();
