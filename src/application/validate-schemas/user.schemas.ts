import { email, object, regexes, string, ZodType } from 'zod';
import { ipString, maxMinString, requiredString } from './helpers.js';

/**
 * Represents the data required to register a new user.
 *
 * @property email - The user's email address (required).
 * @property username - The user's chosen username (optional).
 * @property password - The user's password (required).
 * @property fullName - The user's full name (optional).
 * @property ipAddress - The IP address from which the registration is made (optional).
 */

export interface RegisterUserRequestData {
	email: string;
	username?: string;
	password: string;
	fullName?: string;
	ipAddress?: string;
}

/**
 * Zod schema for validating user registration data.
 *
 * Fields:
 * - `email`: Required string. Must be a valid email address matching the specified regex pattern.
 * - `username`: Optional string. Trimmed, must be between 2 and 30 characters if provided.
 * - `password`: Required string. Must be between 6 and 24 characters.
 * - `fullName`: Optional string. Trimmed, maximum of 100 characters.
 * - `ipAddress`: Optional string. Must be a valid IPv4 address format if provided.
 *
 * Used to validate the shape and constraints of user registration requests.
 */

export const UserRegisterSchema: ZodType<RegisterUserRequestData> = object({
	email: requiredString('Email').pipe(email({ pattern: regexes.email, error: 'Email must be a valid email address' })),
	username: string()
		.trim()
		.pipe(maxMinString({ field: 'User name', min: 3, max: 30 }))
		.optional(),
	password: requiredString('Password').pipe(maxMinString({ field: 'Password', min: 6, max: 24 })),
	fullName: string().trim().max(100, 'Full name must be 100 characters or less').optional(),
	ipAddress: ipString('ipAddress').optional(),
});
