const surveyApi = () => {
	const endpoints = {
		create: 'api/survey/create'
	};

	return {
        /** @param {{ responses: Record<string, string> }} data */
		create({ responses }) {
			return fetch(endpoints.create, {
				method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ responses })
			});
		}
	};
};

export default surveyApi();
