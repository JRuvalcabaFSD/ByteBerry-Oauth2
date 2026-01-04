import { boolean, object, regexes, string, ZodType } from 'zod';
import { ipString, maxMinString, requiredString } from './helpers.js';

/**
 * Represents the data required for user authentication login request.
 *
 * @interface LoginRequestData
 * @property {string} emailOrUserName - The user's email address or username for authentication
 * @property {string} password - The user's password for authentication
 * @property {boolean} [rememberMe] - Optional flag to indicate if the session should persist across browser sessions
 * @property {string} [userAgent] - Optional user agent string from the client making the request
 * @property {string} [ipAddress] - Optional IP address of the client making the authentication request
 */

export interface LoginRequestData {
	emailOrUserName: string;
	password: string;
	rememberMe?: boolean;
	userAgent?: string;
	ipAddress?: string;
}

/**
 * Zod schema for validating login request data.
 *
 * @remarks
 * This schema validates the following fields:
 * - `emailOrUserName`: Must be either a valid email address or a username between 3 and 30 characters
 * - `password`: Required string between 6 and 24 characters
 * - `rememberMe`: Optional boolean flag to persist the user session
 * - `userAgent`: Optional string containing the client's user agent
 * - `ip`: Optional IP address string
 *
 * @example
 * ```typescript
 * const loginData = {
 *   emailOrUserName: "user@example.com",
 *   password: "securePass123",
 *   rememberMe: true
 * };
 * const result = LoginRequestSchema.parse(loginData);
 * ```
 */

export const LoginRequestSchema: ZodType<LoginRequestData> = object({
	emailOrUserName: requiredString('Email or User name').refine((val) => {
		const isEmail = regexes.email.test(val);
		const isUserName = val.length <= 3 && val.length >= 30;
		return isEmail || isUserName;
	}),
	password: requiredString('Password').pipe(maxMinString({ field: 'Password', min: 6, max: 24 })),
	rememberMe: boolean('remember me must be a boolean').optional(),
	userAgent: string().optional(),
	ip: ipString('Ip').optional(),
});
