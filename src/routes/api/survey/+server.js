// import { FETCHER_SECRET } from '$env/static/private';
import dbSurvey from '$lib/db/survey';
import { json } from '@sveltejs/kit';
const FETCHER_SECRET = "TEST_SECRET"
/** @type {import('./$types').RequestHandler} */
export async function GET({ platform, request }) {
	if (!platform) {
		return new Response();
	}
    const authorization = request.headers.get('Authorization')
    if (authorization !== FETCHER_SECRET) {
        return new Response(null, {
            status: 401,
            statusText: 'Unauthorized'
        })
    }
	const db = platform.env.DB;
	const {results} = await dbSurvey(db).getAll();
	return json(results);
}
