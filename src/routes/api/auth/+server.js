/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return new Response();
};

/** @type {import('./$types').RequestHandler} */
export async function DELETE({cookies}) {
    cookies.delete('session', {path: '/'});
    return new Response();
};