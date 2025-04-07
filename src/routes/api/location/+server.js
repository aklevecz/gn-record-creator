import { LOCATION_IQ_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const q = url.searchParams.get('q');

    if (!q) {
        throw error(400, 'Query parameter "q" is required');
    }

    try {
        const response = await fetch(
            `https://api.locationiq.com/v1/search?key=${LOCATION_IQ_API_KEY}&q=${encodeURIComponent(q)}&format=json&dedupe=1&limit=5`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw error(response.status, {
                message: `Location API error: ${JSON.stringify(errorData)}`,
            });
        }

        const data = await response.json();

        return json(data, {
            headers: {
                'Cache-Control': 'max-age=3600' // Cache for 1 hour
            }
        });
    } catch (/** @type {*} */ err) {
        // If it's already an error from SvelteKit, rethrow it
        if (err.status && err.body) {
            throw err;
        }

        // Otherwise create a new error
        throw error(500, 'Failed to fetch location data');
    }
}
