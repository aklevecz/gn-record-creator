import { sentrySvelteKit } from '@sentry/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		allowedHosts: ['local-tix.yaytso.art']
	},
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'yaytso',
				project: 'node-cloudflare-pages'
			}
		}),
		sveltekit(),
		tailwindcss()
	]
});
