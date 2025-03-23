const projectsApi = () => {
	const endpoints = {
		getProjects: '/api/projects'
	};
	return {
		getProjects: async () => {
			const res = await fetch(endpoints.getProjects);
			const data = await res.json();
			if (!res.ok) {
				console.log(`Error getting projects: ${JSON.stringify(data)}`);
				throw new Error(`${data.code}: ${data.message}`);
			}
			return data;
		},
		/** @param {string} projectId */
		deleteProjectById: async (projectId) => {
			const res = await fetch(`${endpoints.getProjects}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ projectId })
			});
			const data = await res.json();
			if (!res.ok) {
				console.log(`Error deleting project ${projectId}: ${JSON.stringify(data)}`);
				throw new Error(`${data.code}: ${data.message}`);
			}
			return data;
		}
	};
};

export default projectsApi();
