import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		allowedHosts: ['local-tix.yaytso.art']
	},
	plugins: [sveltekit(), tailwindcss()]
});
