import dbSurvey from '$lib/db/survey';
import errors from '$lib/errors';
import logger from '$lib/logging';
import { error, json } from '@sveltejs/kit';

// session id denotes a project because it would represent the set of projects for a given user session

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies, platform }) {
	if (!platform) {
		throw error(500, errors.PLATFORM_NOT_FOUND);
	}

	const { env } = platform;
	/** @type {*} ctx */
	const ctx = platform.context;
	const logging = logger(ctx);
	const sessionId = cookies.get('session');

	if (!sessionId) {
		throw error(500, errors.NO_SESSION_FOUND);
	}

	try {
		const { results } = await dbSurvey(env.DB).getAllBySessionId(sessionId);
		return json(results);
	} catch (e) {
		logging.error(`Error getting projects for ${sessionId} ${JSON.stringify(e)}`);
		throw error(500, errors.GET_PROJECT_FAILED);
	}
}
