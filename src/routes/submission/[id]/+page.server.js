import dbSurvey from '$lib/db/survey';
import errors from '$lib/errors';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const id = params.id;

	if (!platform) {
		throw error(500, errors.PLATFORM_NOT_FOUND);
	}

	/** @type {Submission | null} */
	const submission = await dbSurvey(platform?.env.DB).get(id);

    if (!submission) {
        throw error(404, errors.SUBMISSION_NOT_FOUND);
    }
	return { id, submission };
}
