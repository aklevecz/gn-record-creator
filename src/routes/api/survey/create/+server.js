import dbSurvey from '$lib/db/survey';

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform }) {
	if (!platform) {
		return new Response();
	}
	const db = platform.env.DB;
	const res = await dbSurvey(db).getAll();
	console.log(res);
	return new Response();
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	if (!platform) {
		return new Response();
	}
	const db = platform.env.DB;
	const { responses } = await request.json();
	console.log(responses);
	dbSurvey(db).save(responses);
	return new Response();
}
