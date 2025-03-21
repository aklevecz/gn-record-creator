const uploadApi = () => {
	const endpoints = {
		upload: '/api/upload'
	};

	return {
		/** @param {{id: string, projectId: string, image: Blob}} props */
		async uploadTexture({ id, projectId, image }) {
			const formData = new FormData();
			formData.append('image', image);
			formData.append('id', id);
			formData.append('projectId', projectId);
			const res = await fetch(endpoints.upload, {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(`${data.code}: ${data.message}`);
			} else {
				return {
					status: res.status,
					...data
				};
			}
		}
	};
};

export default uploadApi();
