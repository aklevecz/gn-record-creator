const mondayClientApi = () => {
	const endpoints = {
		create: '/api/monday/create',
		status: '/api/monday/status'
	};

	return {
		/** @param {{id: string, mondayId: string, responses: Record<string, string | string[]> }} data */
		async create({ id, mondayId, responses }) {
			console.log(`Data being sent to Monday with id:${id} and mondayId:${mondayId} with responses ${JSON.stringify(responses)}`);
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
		},
		/**
		 * Check if a Monday item has submitted status
		 * @param {string | number} mondayId - The Monday item ID
		 * @returns {Promise<{success: boolean, data?: {isSubmitted: boolean, currentStatus: string, mondayId: string, lastChecked: string}, error?: string}>}
		 */
		async checkSubmittedStatus(mondayId) {
			try {
				const res = await fetch(`${endpoints.status}?mondayId=${encodeURIComponent(mondayId)}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const data = await res.json();
				
				if (!res.ok) {
					console.log(`Error checking submitted status for Monday ID: ${mondayId}`);
					return {
						success: false,
						error: data.error || 'API error'
					};
				}

				return data;
			} catch (error) {
				console.log('Network error checking submitted status:', error);
				return {
					success: false,
					error: 'Network error'
				};
			}
		}
	};
};

export default mondayClientApi();
