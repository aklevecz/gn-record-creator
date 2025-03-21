import errors from '$lib/errors';
import { error, json } from '@sveltejs/kit';

// NEEDS TO RETURN MORE METADATA THAT MIMICS WHAT EXISTS IN IDB

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform, request, params }) {
	if (!platform) return error(500, errors.PLATFORM_NOT_FOUND);
	const { projectId } = params;
	const {
		env: { R2 }
	} = platform;

	const coverUploadsPrefix = 'cover-uploads';
	const host = request.url.split('/api')[0];
	const list = await R2.list({ prefix: coverUploadsPrefix + '/' + projectId });

	const r2Objects = [];
	for (const object of list.objects) {
		const key = encodeURIComponent(object.key.replace(`${coverUploadsPrefix}/`, ''));
		r2Objects.push(`${host}/api/upload/${key}`);
		// const r2Object = await R2.get(object.key);
		// r2Objects.push(r2Object);
	}
	return json(r2Objects);
}
