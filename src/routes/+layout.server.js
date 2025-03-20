/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const session = cookies.get('session');
	if (!session) {
		/** @type {import('cookie').CookieSerializeOptions & { path: string }} */
		const options = {
			httpOnly: true,
			path: '/',
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		};
		cookies.set('session', crypto.randomUUID(), options);
	}
	return {};
}
