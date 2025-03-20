import dbSurvey from '$lib/db/survey';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, platform }) {
	const { id } = params;
	if (!platform) {
		console.log(`No platform found`);
		return new Response('No platform found', { status: 500 });
	}
	const { env } = platform;
	const survey = await dbSurvey(env.DB).get(id);
	return json(survey);
}
