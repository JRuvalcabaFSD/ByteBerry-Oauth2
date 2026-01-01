/**
 * Returns a human-readable error message from an unknown error object.
 *
 * If the provided error is an instance of `Error`, its `message` property is returned.
 * Otherwise, a generic 'Unknown Error' message is returned.
 *
 * @param error - The error object to extract the message from.
 * @returns The error message string.
 */

export function getErrMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Unknown Error';
}
