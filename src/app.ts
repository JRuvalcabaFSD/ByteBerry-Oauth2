import dotenv from 'dotenv';

import { handledServicesError } from '@shared';
import { bootstrapContainer } from '@container';

(() => {
	main().catch((error) => {
		handledServicesError(error);
		process.exit(1);
	});
})();

async function main() {
	dotenv.config({ override: false });
	const container = bootstrapContainer();

	const logger = container.resolve('Logger');
	const { port, serviceUrl } = container.resolve('Config');

	logger.info(`service available in the url: ${serviceUrl}:${port}`);
}
