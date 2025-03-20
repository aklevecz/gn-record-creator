import dbSurvey from '$lib/db/survey';
import logger from '$lib/logging';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, platform, request }) {
	if (!platform) {
		return new Response();
	}
	const db = platform.env.DB;
	const { id, responses } = await request.json();
	const session = cookies.get('session');
	try {
		/** @type {*} ctx */
		const ctx = platform?.context;
		const logging = logger(ctx);
		ctx.waitUntil(dbSurvey(db).upsert(id, {...responses, session}))
		logging.info(`Created survey ${id} with responses ${JSON.stringify(responses)}`);
	} catch (e) {
		console.log(e);
	}
	return new Response('OK');
}
