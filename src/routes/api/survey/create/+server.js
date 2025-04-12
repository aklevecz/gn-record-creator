import dbSurvey from '$lib/db/survey';
import errors from '$lib/errors';
import logger from '$lib/logging';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, platform, request }) {
	if (!platform) {
		throw error(500, errors.PLATFORM_NOT_FOUND);
	}
	/** @type {*} ctx */
	const ctx = platform.context;

	const db = platform.env.DB;
	const { id, mondayId, responses } = await request.json();
	const session = cookies.get('session');

	const logging = logger(ctx);
	try {
		ctx.waitUntil(dbSurvey(db).upsert(id, { ...responses, session, monday_id: mondayId }));
		logging.info(`Upsert survey for id:${id} mondayId:${mondayId} with responses ${JSON.stringify(responses)}`);
		return json({ success:true });
	} catch (e) {
		// maybe dont need both sentry and betterstack logging
		console.log(e);
		logging.error(`Error creating survey ${id} ${e}`);
		throw error(500, errors.UPDATE_SURVEY_FAILED);
	}
}
