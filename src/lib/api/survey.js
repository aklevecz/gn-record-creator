const surveyApi = () => {
	const endpoints = {
		create: 'api/survey/create'
	};

	return {
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
