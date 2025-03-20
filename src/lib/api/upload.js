const uploadApi = () => {
	const endpoints = {
		upload: '/api/upload'
	};

	return {
        /** @param {{id: string, projectId: string, image: Blob}} props */
        uploadTexture({id, projectId, image}) {
            const formData = new FormData();
            formData.append('image', image)
            formData.append('id', id)
            formData.append('projectId', projectId)
            return fetch(endpoints.upload, {
                method: 'POST',
                body: formData
            });
        }
    };
};

export default uploadApi()
