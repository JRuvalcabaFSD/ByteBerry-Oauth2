/* eslint-disable no-console */
import { Config } from '@config';
import { getErrMessage } from '@shared';

(() => {
	main().catch((error) => {
		console.error(getErrMessage(error));
		process.exit(1);
	});
})();

async function main() {
	const config = new Config();
	console.log({ config });
}
