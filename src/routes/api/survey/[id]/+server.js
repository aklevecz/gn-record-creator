import dbSurvey from '$lib/db/survey';
import logger from '$lib/logging';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, platform }) {
	const { id } = params;
	if (!platform) {
		console.log(`No platform found`);
		return new Response('No platform found', { status: 500 });
	}
	const { env } = platform;
	/** @type {*} ctx */
	const ctx = platform?.context;
	const logging = logger(ctx);
	try {
		const survey = await dbSurvey(env.DB).get(id);
		return json(survey);
	} catch (e) {
        logging.error(`Error getting survey ${id} ${JSON.stringify(e)}`);
		return new Response('NOT FOUND', { status: 404 });
	}
}
