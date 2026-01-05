import z, { boolean, object, regexes, string, url, ZodType } from 'zod';
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
 * Represents the data required for an OAuth 2.0 authorization code request with PKCE support.
 *
 * @interface CodeRequestData
 *
 * @property {string} clientId - The unique identifier of the client application requesting authorization.
 * @property {string} redirectUri - The URI where the authorization server will redirect the user after authorization.
 * @property {string} responseType - The OAuth 2.0 response type (typically "code" for authorization code flow).
 * @property {string} codeChallenge - The PKCE code challenge derived from the code verifier.
 * @property {'S256' | 'plain'} codeChallengeMethod - The method used to generate the code challenge. 'S256' uses SHA-256 hashing, 'plain' uses the verifier directly.
 * @property {string} [state] - Optional state parameter for CSRF protection and maintaining state between request and callback.
 * @property {string} [scope] - Optional space-delimited list of scopes requested by the client.
 */

export interface CodeRequestData {
	clientId: string;
	redirectUri: string;
	responseType: string;
	codeChallenge: string;
	codeChallengeMethod: 'S256' | 'plain';
	state?: string;
	scope?: string;
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

/**
 * Zod schema for validating OAuth 2.0 authorization code request parameters.
 *
 * @remarks
 * This schema validates and transforms incoming authorization code requests according to OAuth 2.0
 * and PKCE (Proof Key for Code Exchange) specifications. It enforces:
 * - Required client identification and redirect URI
 * - Response type must be "code"
 * - PKCE code challenge (43 characters, base64url encoded)
 * - Code challenge method (S256 or plain)
 * - Optional state and scope parameters
 *
 * @example
 * ```typescript
 * const result = AuthCodeRequestSchema.parse({
 *   client_id: "my-client-id",
 *   redirect_uri: "https://example.com/callback",
 *   response_type: "code",
 *   code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
 *   code_challenge_method: "S256",
 *   state: "xyz",
 *   scope: "read write"
 * });
 * ```
 *
 * @returns Transformed object with camelCase property names
 */

export const CodeRequestSchema: ZodType<CodeRequestData> = object({
	client_id: requiredString('Client ID'),
	redirect_uri: requiredString('Redirect URI').pipe(url('Redirect URI must be a valid URL')),
	response_type: requiredString('Response type').refine((val) => val === 'code', 'Response type must be "code"'),
	code_challenge: requiredString('Code challenge')
		.length(43, 'Code challenge must be 43 characters')
		.regex(/^[A-Za-z0-9_-]+$/, 'Code Challenge must be pure base64url encoded'),
	state: string().max(500, 'state must be less than 500 characters').optional(),
	code_challenge_method: z.enum(['S256', 'plain'], 'Code Challenge method must be S256 or plain'),
	scope: string().optional(),
}).transform((data) => ({
	clientId: data.client_id,
	redirectUri: data.redirect_uri,
	responseType: data.response_type,
	codeChallenge: data.code_challenge,
	codeChallengeMethod: data.code_challenge_method,
	state: data.state,
	scope: data.scope,
}));
