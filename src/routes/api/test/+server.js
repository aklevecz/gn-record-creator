import logger from '$lib/logging';

/** @type {import('./$types').RequestHandler} */
export async function GET({platform}) {
    if (!platform) {
        console.log(`No platform found`);
        return new Response('No platform found', { status: 500 });
    }
    /** @type {*} context */
    const context = platform.context;
    logger(context).info("TESTING LOGS")
    return new Response();
};