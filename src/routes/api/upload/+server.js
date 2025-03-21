import errors from '$lib/errors';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	const formData = await request.formData();
	const id = formData.get('id');
	const projectId = formData.get('projectId');
	const image = formData.get('image');

	if (!platform) {
		throw error(500, errors.PLATFORM_NOT_FOUND);
	}

	const { context, env } = platform;

	if (!image || !(image instanceof File)) {
		return new Response('No image found', { status: 400 });
	}

	const contentType = image.type.toLowerCase();

	// for default image
	const filepath = `cover-uploads/${projectId}`;
	context.waitUntil(
		env.R2.put(filepath, image, {
			httpMetadata: {
				// 'Cache-Control': 'max-age=31536000',
				contentType
			},
			customMetadata: {}
		})
	);

	// for individual images
	const filepath2 = `cover-uploads/${projectId}/${id}`;
	context.waitUntil(
		env.R2.put(filepath2, image, {
			httpMetadata: {
				// 'Cache-Control': 'max-age=31536000',
				contentType
			},
			customMetadata: {}
		})
	);
	return json({ success: true });
}
