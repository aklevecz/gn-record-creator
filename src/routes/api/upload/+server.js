/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	const formData = await request.formData();
	const id = formData.get('id');
	const image = formData.get('image');

	if (!platform) {
		console.log(`No platform found`);
		return new Response('No platform found', { status: 500 });
	}
	const { context, env } = platform;

	if (!image || !(image instanceof File)) {
		return new Response('No image found', { status: 400 });
	}

	const contentType = image.type.toLowerCase();

	const filepath = `cover-uploads/${id}`;
	context.waitUntil(
		env.R2.put(filepath, image, {
			httpMetadata: {
				'Cache-Control': 'max-age=31536000',
				contentType
			}
		})
	);

	return new Response('success', { status: 200 });
}
