import { CodeRequestData, CodeRequestSchema, formattedZodError } from '@application';
import { ValidateRequestError } from '@shared';

/**
 * Data Transfer Object for OAuth 2.0 authorization code requests with PKCE support.
 *
 * This DTO encapsulates the parameters required for initiating an OAuth 2.0 authorization
 * code flow with Proof Key for Code Exchange (PKCE). It validates incoming query parameters
 * against a predefined schema and ensures type safety.
 *
 * @remarks
 * The class uses a private constructor pattern with a static factory method to ensure
 * all instances are properly validated before creation.
 *
 * @example
 * ```typescript
 * const queryParams = {
 *   client_id: 'my-client',
 *   redirect_uri: 'https://example.com/callback',
 *   response_type: 'code',
 *   code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
 *   code_challenge_method: 'S256',
 *   state: 'random-state-string',
 *   scope: 'read write'
 * };
 *
 * const codeRequest = CodeRequestDTO.fromQuery(queryParams);
 * ```
 *
 * @throws {ValidateRequestError} When the query parameters fail validation against CodeRequestSchema
 */

export class CodeRequestDTO {
	public readonly clientId!: string;
	public readonly redirectUri!: string;
	public readonly responseType!: string;
	public readonly codeChallenge!: string;
	public readonly codeChallengeMethod!: 'S256' | 'plain';
	public readonly state?: string;
	public readonly scope?: string;

	private constructor(data: CodeRequestData) {
		Object.assign(this, data);
	}

	/**
	 * Creates a CodeRequestDTO instance from a query string object.
	 *
	 * @param query - A record containing query string parameters as key-value pairs
	 * @returns A new CodeRequestDTO instance created from the validated query data
	 * @throws {ValidateRequestError} When the query parameters fail validation against CodeRequestSchema
	 *
	 * @example
	 * ```typescript
	 * const query = { code: 'abc123', state: 'xyz789' };
	 * const dto = CodeRequestDTO.fromQuery(query);
	 * ```
	 */

	public static fromQuery(query: Record<string, string>): CodeRequestDTO {
		const resp = CodeRequestSchema.safeParse({ ...query });

		if (!resp.success) {
			const formatted = formattedZodError(resp.error, 'form');

			throw new ValidateRequestError(formatted.msg, formatted.errors);
		}

		return new CodeRequestDTO(resp.data);
	}
}

/**
 * Data Transfer Object representing an OAuth2 authorization code response.
 *
 * This DTO encapsulates the authorization code and optional state parameter
 * returned during the OAuth2 authorization code flow.
 *
 * @remarks
 * The class provides utility methods to build redirect URLs with the authorization
 * code and state parameters, as well as JSON serialization capabilities.
 *
 * @example
 * ```typescript
 * const codeResponse = new CodeResponseDTO('auth_code_123', 'random_state');
 * const redirectUrl = codeResponse.buildRedirectURrl('https://example.com/callback');
 * // Returns: 'https://example.com/callback?code=auth_code_123&state=random_state'
 * ```
 */

export class CodeResponseDTO {
	constructor(
		public readonly code: string,
		public readonly state?: string
	) {}

	/**
	 * Builds a redirect URL by appending authorization code and optional state parameters.
	 *
	 * @param baseRedirectUri - The base URI to which the code and state parameters will be appended
	 * @returns A complete redirect URL string with the authorization code and optional state as query parameters
	 *
	 * @example
	 * ```ts
	 * const redirectUrl = buildRedirectURrl('https://example.com/callback');
	 * // Returns: 'https://example.com/callback?code=abc123&state=xyz789'
	 * ```
	 */

	public buildRedirectURrl(baseRedirectUri: string): string {
		const url = new URL(baseRedirectUri);
		url.searchParams.set('code', this.code);

		if (this.state) {
			url.searchParams.set('state', this.state);
		}

		return url.toString();
	}

	public toJSON(): { code: string; state?: string } {
		return {
			code: this.code,
			...(this.state && { state: this.state }),
		};
	}
}
