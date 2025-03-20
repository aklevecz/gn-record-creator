import dbSurvey from '$lib/db/survey';
import logger from '$lib/logging';
import { json } from '@sveltejs/kit';

// session id denotes a project because it would represent the set of projects for a given user session

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies, platform }) {
	if (!platform) {
		console.log(`No platform found`);
		return new Response('No platform found', { status: 500 });
	}

	const { env } = platform;
	/** @type {*} ctx */
	const ctx = platform?.context;
	const logging = logger(ctx);
	const sessionId = cookies.get('session');

	if (!sessionId) {
		return new Response('NO SESSION FOUND', { status: 404 });
	}

	try {
		const {results} = await dbSurvey(env.DB).getAllBySessionId(sessionId);
		return json(results);
	} catch (e) {
		logging.error(`Error getting projects for ${sessionId} ${JSON.stringify(e)}`);
		return new Response('NOT FOUND', { status: 404 });
	}
}
