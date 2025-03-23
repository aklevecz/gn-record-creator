const uploadApi = () => {
	const endpoints = {
		upload: '/api/upload'
	};

	return {
		/** @param {{id: string, fileName: string, projectId: string, image: Blob, seed:string, prompt:string}} props */
		async uploadTexture({ id, fileName, projectId, image, seed, prompt }) {
            // id is just fileHash at this point?
			const formData = new FormData();
			formData.append('image', image);
			formData.append('id', id);
            formData.append('fileName', fileName);
			formData.append('projectId', projectId);
			formData.append('seed', seed);
            formData.append('prompt', prompt);

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
		},
        /** @param {string} textureFilePath */
        async deleteTexture(textureFilePath) {
            const res = await fetch(`${endpoints.upload}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ textureFilePath })
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
