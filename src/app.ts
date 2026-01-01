/* eslint-disable no-console */
import dotenv from 'dotenv';
import { bootstrapContainer } from './container/bootstrap.container.js';
import { handledServicesError } from './shared/errors/handler.errors.js';

(() => {
	main().catch((error) => {
		handledServicesError(error);
		process.exit(1);
	});
})();

async function main() {
	dotenv.config({ override: false });
	const container = bootstrapContainer();

	const config = container.resolve('Config');

	console.log({ config });
}
