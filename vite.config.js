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
                project: 'gn-record-creator'
            }
        }),
        sveltekit(),
        tailwindcss()
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
