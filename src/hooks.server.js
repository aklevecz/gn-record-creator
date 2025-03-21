import { sequence } from '@sveltejs/kit/hooks';
// import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry, sentryHandle, initCloudflareSentryHandle } from '@sentry/sveltekit';
import { PUBLIC_SENTRY_ENDPOINT } from '$env/static/public';

// Sentry.init({
// 	dsn: PUBLIC_SENTRY_ENDPOINT,
// 	tracesSampleRate: 1
// });


// export const handle = sequence(Sentry.sentryHandle());
export const handle = sequence(
	initCloudflareSentryHandle({
		dsn: PUBLIC_SENTRY_ENDPOINT,
		tracesSampleRate: 1.0
	}),
	sentryHandle()
);

export const handleError = handleErrorWithSentry();
// import { sequence } from '@sveltejs/kit/hooks';

// // 'https://examplePublicKey@o0.ingest.sentry.io/0'
// const dns = 'https://07a0d2b8b79ce627854fc57d0ad0b4cd@o4509011046170624.ingest.us.sentry.io/4509011049316352'

// // export const handleError = handleErrorWithSentry(myErrorHandler);
// export const handleError = handleErrorWithSentry();
