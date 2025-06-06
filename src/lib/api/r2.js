const r2Api = () => {
    const endpoints = {
        coverUploads: '/api/r2/cover-uploads'
    }

    return {
        /** 
         * @param {string} projectId 
         * @returns {Promise<string[]>}
        */
        getAllUploadsByProjectId: async (projectId) => {
            const res = await fetch(`${endpoints.coverUploads}/${projectId}`);
            const data = await res.json();
            if (!res.ok) {
                console.log(`Error getting uploads for project ${projectId}: ${JSON.stringify(data)}`);
                throw new Error(`${data.code}: ${data.message}`)
            }
            return data
        }
    }
}

export default r2Api()