// IS THIS EVEN USED?

import { cover } from 'three/src/extras/TextureUtils.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, request, platform }) {
	const { id } = params;

	if (!platform) {
		console.log(`No platform found`);
		return new Response('No platform found', { status: 500 });
	}
	const { env } = platform;

	const coverUploadsPrefix = 'cover-uploads'

	const file = `${coverUploadsPrefix}/${id}`;
	const object = await env.R2.get(file);
	if (!object) {
		return new Response('Image not found', { status: 404 });
	}
	return new Response(object.body, {
		headers: {
			'content-type': object.httpMetadata?.contentType || 'image/jpeg',
			'cache-control': 'public, max-age=31536000',
			etag: object.httpEtag
		}
	});
}
