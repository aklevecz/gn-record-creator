import dbSurvey from '$lib/db/survey';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, platform, request }) {
	if (!platform) {
		return new Response();
	}
	const db = platform.env.DB;
	const { id, responses } = await request.json();
	const session = cookies.get('session');
	try {
		await dbSurvey(db).upsert(id, {...responses, session});
	} catch (e) {
		console.log(e);
	}
	return new Response('OK');
}
