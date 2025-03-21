import { dev } from '$app/environment';
import { PUBLIC_SENTRY_ENDPOINT } from '$env/static/public';
// import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
Sentry.init({
	dsn: PUBLIC_SENTRY_ENDPOINT,
	environment: dev ? 'development' : 'production',
	tracesSampleRate: 1.0
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
// export const handleError = handleErrorWithSentry();
