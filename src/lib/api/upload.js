const uploadApi = () => {
	const endpoints = {
		upload: '/api/upload'
	};

	return {
        /** @param {{id: string, image: File}} props */
        uploadTexture({id, image}) {
            const formData = new FormData();
            formData.append('image', image)
            formData.append('id', id)
            return fetch(endpoints.upload, {
                method: 'POST',
                body: formData
            });
        }
    };
};

export default uploadApi()
