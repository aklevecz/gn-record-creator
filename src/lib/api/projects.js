const projectsApi = () => {
	const endpoints = {
		getProjects: '/api/projects'
	};
	return {
		getProjects: async () => {
			const res = await fetch(endpoints.getProjects);
            const data = await res.json();
            return data
		}
	};
};

export default projectsApi()