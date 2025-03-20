import { BETTER_STACK_ENDPOINT, BETTER_STACK_TOKEN } from '$env/static/private';
import { Logtail } from '@logtail/edge';

export const baseLogger = new Logtail(BETTER_STACK_TOKEN, {
	endpoint: BETTER_STACK_ENDPOINT
});

const noopLogger = {
    debug: () => {},
    info: () => {},
    error: () => {}
}

/** @param {import('@cloudflare/workers-types').ExecutionContext | undefined} ctx */
const logger = (ctx) => {
    if (!ctx) {
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