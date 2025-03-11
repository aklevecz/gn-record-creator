import dbSurvey from '$lib/db/survey';
import { sub } from 'three/tsl';

/** @type {import('./$types').PageServerLoad} */
export async function load({params, platform}) {
    const id = params.id
    const submission = await dbSurvey(platform?.env.DB).get(id)
    return {id, submission};
};