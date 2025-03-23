import dbSurvey from '$lib/db/survey';
import errors from '$lib/errors';
import logger from '$lib/logging';
import { error, json } from '@sveltejs/kit';

// NOT SURE IF SHOULD BE USING THIS ENDPOINT OR SURVEY
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

export async function DELETE({ platform, request }) {
	if (!platform) {
		throw error(500, errors.PLATFORM_NOT_FOUND);
	}
	const { projectId } = await request.json();
	const { env } = platform;
	/** @type {*} ctx */
	const ctx = platform.context;
	// const sessionId = cookies.get('session');

	// if (!sessionId) {
	// 	throw error(500, errors.NO_SESSION_FOUND);
	// }
	try {
		await dbSurvey(env.DB).deleteByProjectId(projectId);
		// this check could be better and the error could be better as well
		const p = await dbSurvey(env.DB).get(projectId);
		if (!p) {
			return json({ success: true });
		}
		throw error(500, errors.DELETE_PROJECT_FAILED);
	} catch (e) {
		console.log(e);
		logger(ctx).error(`Error deleting projects for ${projectId} ${JSON.stringify(e)}`);
		throw error(500, errors.DELETE_PROJECT_FAILED);
	}
}
