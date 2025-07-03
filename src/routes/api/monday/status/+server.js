import mondayServer from '$lib/api/monday.server';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const mondayId = url.searchParams.get('mondayId');
    
    if (!mondayId) {
        return json(
            { 
                success: false, 
                error: 'Monday ID is required' 
            }, 
            { status: 400 }
        );
    }

    try {
        const result = await mondayServer.getSubmittedStatus(mondayId);
        
        if (result.success) {
            return json(result);
        } else {
            return json(result, { status: 404 });
        }
    } catch (error) {
        console.error('Error checking submitted status:', error);
        return json(
            { 
                success: false, 
                error: 'Internal server error' 
            }, 
            { status: 500 }
        );
    }
}