import { BETTER_STACK_ENDPOINT, BETTER_STACK_TOKEN } from '$env/static/private';
import { Logtail } from '@logtail/edge';

const noopLogger = {
    debug: () => {},
    info: () => {},
    error: () => {}
}

const hasCredentials = !!BETTER_STACK_TOKEN && !!BETTER_STACK_ENDPOINT;

export const baseLogger = hasCredentials
	? new Logtail(BETTER_STACK_TOKEN, { endpoint: BETTER_STACK_ENDPOINT })
	: null;

/** @param {import('@cloudflare/workers-types').ExecutionContext | undefined} ctx */
const logger = (ctx) => {
    if (!ctx || !baseLogger) {
        return noopLogger
    }

	const loggingClient = baseLogger.withExecutionContext(ctx);

	return {
		/** @param {string} message */
		debug(message) {
			loggingClient.debug(message);
		},

		/** @param {string} message */
		info(message) {
			loggingClient.info(message);
		},

		/** @param {string} message */
		error(message) {
			loggingClient.error(message);
		}
	};
};

export default logger;