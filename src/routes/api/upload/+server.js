import { coverUploadsPrefix } from '$lib/constants';
import errors from '$lib/errors';
import { error, json } from '@sveltejs/kit';

/** 
 * This is the server route for uploading images to R2
 * Currently only handles cover-uploads
 */

/** @type {import('./$types').RequestHandler} */
export async function POST({ platform, request }) {
	const formData = await request.formData();
	const image = formData.get('image');
	// should be explicit about fileHash?
	const id = formData.get('id');
	const fileName = formData.get('fileName') || 'file-name-missing';
	const projectId = formData.get('projectId') || 'project-id-missing';
	const seed = formData.get('seed') || 'seed-missing';
	const prompt = formData.get('prompt') || 'prompt-missing';

	if (!platform) {
		throw error(500, errors.PLATFORM_NOT_FOUND);
	}

	const { context, env } = platform;

	if (!image || !(image instanceof File)) {
		return json({ success: false });
	}

	const contentType = image.type.toLowerCase();

	/** @type {*} */
	const customMetadata = {
		seed,
		prompt,
		id,
		fileHash: id,
		fileName,
		projectId,
		lastModified: Date.now()
	};

	// for default image
	const filepath = `cover-uploads/${projectId}`;
	context.waitUntil(
		env.R2.put(filepath, image, {
			httpMetadata: {
				cacheControl: 'max-age=31536000',
				contentType
			},
			customMetadata
		})
	);

	// for individual images
	const filepath2 = `cover-uploads/${projectId}/${id}`;
	context.waitUntil(
		env.R2.put(filepath2, image, {
			httpMetadata: {
				cacheControl: 'max-age=31536000',
				contentType
			},
			customMetadata
		})
	);
	return json({ success: true });
}


export async function DELETE({  platform, request }) {
	const { textureFilePath } = await request.json();
	if (!platform) {
		return error(500, errors.PLATFORM_NOT_FOUND);
	}
	const { env } = platform;
	platform.context.waitUntil(env.R2.delete(`${coverUploadsPrefix}/${textureFilePath}`))
	return json({ success: true });
}