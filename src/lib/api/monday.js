const mondayClientApi = () => {
    const endpoints = {
        create:'/api/monday/create'
    }   

    return {
        /** @param {{id: string, responses: Record<string, string> }} data */
        create({ id, responses }) {
            return fetch(endpoints.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, responses })
            });
        }
    };
}

export default mondayClientApi()