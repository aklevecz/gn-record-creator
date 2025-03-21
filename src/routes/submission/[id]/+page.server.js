import dbSurvey from '$lib/db/survey';

/** @type {import('./$types').PageServerLoad} */
export async function load({params, platform}) {
    const id = params.id
    /** @type {Submission | null} */
    const submission =  platform?.env.DB ? await dbSurvey(platform?.env.DB).get(id) : null
    return {id, submission};
};