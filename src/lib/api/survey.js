const surveyApi = () => {
	const endpoints = {
		getById: '/api/survey',
		create: '/api/survey/create'
	};

	return {
		/** @param {string} id */
		async get(id) {
			const res = await fetch(`${endpoints.getById}/${id}`);
			const data = await res.json();
			if (!res.ok) {
				console.log(`${data.message} for survey ${id}`);
				throw new Error(data.code);
			}
			return data;
		},
		/** @param {{id: string, mondayId: string, responses: Record<string, string | string[]> }} data */
		async create({ id, mondayId, responses }) {
			const res = await fetch(endpoints.create, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, mondayId, responses })
			});

			const data = await res.json();
			if (!res.ok) {
				console.log(`Error creating survey with id ${id}: ${JSON.stringify(responses)}`);
				throw Error(`${data.code}: ${data.message}`);
			}
			return data;
		}
	};
};

export default surveyApi();
