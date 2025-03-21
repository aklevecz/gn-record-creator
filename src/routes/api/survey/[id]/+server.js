import dbSurvey from '$lib/db/survey';
import errors from '$lib/errors';
import logger from '$lib/logging';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, platform }) {
	const { id } = params;
	if (!platform) {
		throw error(500, errors.PLATFORM_NOT_FOUND);
	}
	const { env } = platform;
	/** @type {*} ctx */
	const ctx = platform?.context;
	const logging = logger(ctx)
	try {
		const survey = await dbSurvey(env.DB).get(id);
		return json(survey);
	} catch (e) {
        logging.error(`Error getting survey ${id} ${JSON.stringify(e)}`);
		throw error(500, errors.GET_SURVEY_FAILED);
	}
}
