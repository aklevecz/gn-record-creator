const mondayClientApi = () => {
	const endpoints = {
		create: '/api/monday/create'
	};

	return {
		/** @param {{id: string, responses: Record<string, string> }} data */
		async create({ id, responses }) {
			const res = await fetch(endpoints.create, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, responses })
			});

            const data = await res.json();
            if (!res.ok) {
                console.log(`Error updating Monday with id ${id}: ${JSON.stringify(responses)}`);
                throw Error(`${data.code}: ${data.message}`);
            }
            return data;
		}
	};
};

export default mondayClientApi();
