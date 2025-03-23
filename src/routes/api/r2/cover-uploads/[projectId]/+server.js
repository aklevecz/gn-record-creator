import { coverUploadsPrefix } from '$lib/constants';
import errors from '$lib/errors';
import { error, json } from '@sveltejs/kit';

// LIST ALL KEYS BY PROJECT ID
/** @type {import('./$types').RequestHandler} */
export async function GET({ platform, request, params }) {
	if (!platform) return error(500, errors.PLATFORM_NOT_FOUND);
	const { projectId } = params;
	const {
		env: { R2 }
	} = platform;

	const host = request.url.split('/api')[0];
	const list = await R2.list({ prefix: coverUploadsPrefix + '/' + projectId });

	const r2Objects = [];
	for (const object of list.objects) {
		r2Objects.push(object.key)
		// const key = encodeURIComponent(object.key.replace(`${coverUploadsPrefix}/`, ''));
		// r2Objects.push(`${host}/api/upload/${key}`);
	}
	return json(r2Objects);
}
