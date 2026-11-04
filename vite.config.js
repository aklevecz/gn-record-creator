import { sentrySvelteKit } from '@sentry/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

// Cloudflare Pages' build image sets NODE_OPTIONS=--use-openssl-ca, which Node 18
// refuses to pass on to the worker SvelteKit forks during the build. Strip it first.
if (process.env.NODE_OPTIONS?.includes('--use-openssl-ca')) {
    process.env.NODE_OPTIONS = process.env.NODE_OPTIONS.replace('--use-openssl-ca', '').trim();
}

export default defineConfig({
    server: {
        allowedHosts: ['local-tix.yaytso.art']
    },
    plugins: [
        sentrySvelteKit({
            sourceMapsUploadOptions: {
                org: 'yaytso',
                project: 'gn-record-creator'
            }
        }),
        sveltekit(),
        tailwindcss(),
        devtoolsJson()
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Create a chunk for three.js and related modules
                    if (id.includes('node_modules/three')) {
                        return 'three-vendor';
                    }
                    // Create a chunk for your Three.js scene
                    if (id.includes('ThreeScene.js')) {
                        return 'three-scene';
                    }
                }
            }
        }
    }
});
