import { coverUploadsPrefix } from '$lib/constants';
import errors from '$lib/errors';
import { error } from '@sveltejs/kit';

/**
 * This is the route for fetching images from the R2 bucket
 * Currently this is only used for the cover images
 */

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, request, platform }) {
	// id is a combination of the project id and the filehash/filename
	const { id } = params;

	if (!platform) {
		return error(500, errors.PLATFORM_NOT_FOUND);
	}
	const { env } = platform;

	const file = `${coverUploadsPrefix}/${id}`;
	const object = await env.R2.get(file);
	const metadata = object?.customMetadata;

	if (!object) {
		const defaultImgUrl = request.url.split('/api')[0] + '/characters/infatuation-color.png';
		const res = await fetch(defaultImgUrl);
		return new Response(res.body, {
			headers: {
				'content-type': res.headers.get('content-type') || 'image/png',
				'cache-control': 'public, max-age=31536000',
				'x-metadata': JSON.stringify({ defaultImage: true })
			}
		});
	}
	return new Response(object.body, {
		headers: {
			'content-type': object.httpMetadata?.contentType || 'image/jpeg',
			'cache-control': 'public, max-age=31536000',
			etag: object.httpEtag,
			'x-metadata': JSON.stringify(metadata)
		}
	});
}


