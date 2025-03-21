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
				throw new Error(`${data.code}: ${data.message}`)
			}
            return data
		}
	};
};

export default projectsApi()