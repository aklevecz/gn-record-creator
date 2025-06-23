import { ADMIN_NAME, ADMIN_SECRET } from '$env/static/private';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
    const params = url.searchParams;
    if (params.get(ADMIN_NAME) !== ADMIN_SECRET) {
        throw error(404, 'Not Found');
    }
    return {};
}
