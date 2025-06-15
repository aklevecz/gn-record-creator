const mondayClientApi = () => {
	const endpoints = {
		create: '/api/monday/create'
	};

	return {
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
                console.log(`Error updating Monday with id:${id} and mondayId:${mondayId} with responses ${JSON.stringify(responses)}`);
                throw Error(`${data.code}: ${data.message}`);
            }
            return data;
		}
	};
};

export default mondayClientApi();
