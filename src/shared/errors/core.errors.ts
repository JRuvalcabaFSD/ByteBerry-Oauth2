import { AppError } from '@domain';

/**
 * Represents an error related to configuration issues within the application.
 * Extends the {@link AppError} class to provide additional context for configuration errors.
 *
 * @example
 * throw new ConfigError('Missing required environment variable', { variable: 'DATABASE_URL' });
 *
 * @param msg - A descriptive message explaining the configuration error.
 * @param context - Optional additional context about the error as a record of key-value pairs.
 */

export class ConfigError extends AppError {
	constructor(msg: string, context?: Record<string, unknown>) {
		super(msg, 'config', context);
		this.name = 'ConfigError';

		Error.captureStackTrace(this, ConfigError);
	}
}
