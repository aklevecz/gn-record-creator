import dbSurvey from '$lib/db/survey';

/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	if (!platform) {
		return new Response();
	}
	const db = platform.env.DB;
	const { id, responses } = await request.json();
	try {
		await dbSurvey(db).upsert(id, responses);
	} catch (e) {
		console.log(e);
	}
	return new Response('OK');
}
