import type { IJwksService, IKeyLoader, JwkEntry, JwksResponse } from '@interfaces';
import { getErrMessage, Injectable, InvalidRSAError } from '@shared';
import { createPublicKey } from 'crypto';

/**
 * Service responsible for managing JSON Web Key Sets (JWKS) and converting RSA public keys to JWK format.
 *
 * This service provides functionality to:
 * - Convert PEM-encoded RSA public keys to JWK (JSON Web Key) format
 * - Cache and serve JWKS responses for token validation
 * - Validate public key format and requirements
 *
 * The service implements caching to avoid repeated conversions of the same public key.
 * It expects RSA public keys in PEM format and exports them as JWK entries suitable
 * for JWT signature verification using the RS256 algorithm.
 *
 * @implements {IJwksService}
 *
 * @example
 * ```typescript
 * const keysLoader = new KeyLoader();
 * const jwksService = new JwksService(keysLoader);
 * const jwks = await jwksService.getJwks();
 * ```
 */

@Injectable({ name: 'JwksService', depends: ['KeyLoader'] })
export class JwksService implements IJwksService {
	private cachedJwks: JwksResponse | null = null;
	private readonly publicKey: string;
	private readonly keyId: string;

	constructor(keysLoader: IKeyLoader) {
		this.publicKey = keysLoader.getPublicKey();
		this.keyId = keysLoader.getKeyId();
		this.validatePublicKey();
	}

	/**
	 * Retrieves the JSON Web Key Set (JWKS) containing the public keys used for token verification.
	 *
	 * This method implements caching to avoid redundant conversions. If a cached JWKS exists,
	 * it returns the cached version. Otherwise, it converts the PEM key to JWK format,
	 * caches the result, and returns it.
	 *
	 * @returns {Promise<JwksResponse>} A promise that resolves to the JWKS response containing an array of JSON Web Keys
	 */

	public async getJwks(): Promise<JwksResponse> {
		if (this.cachedJwks) return this.cachedJwks;

		const jwk = this.convertPemToJwk();

		this.cachedJwks = {
			keys: [jwk],
		};

		return this.cachedJwks;
	}

	/**
	 * Converts a PEM-formatted RSA public key to JWK (JSON Web Key) format.
	 *
	 * This method exports the public key as a JWK object containing the RSA modulus (n)
	 * and exponent (e) components, along with metadata for JWT signature verification.
	 *
	 * @returns {JwkEntry} A JWK object with the following properties:
	 *   - kty: Key type (always 'RSA')
	 *   - kid: Key identifier from this.keyId
	 *   - use: Key usage (always 'sig' for signature)
	 *   - alg: Algorithm (always 'RS256')
	 *   - n: RSA modulus (base64url encoded)
	 *   - e: RSA exponent (base64url encoded)
	 *
	 * @throws {InvalidRSAError} When the RSA public key is missing required components (n or e)
	 * @throws {Error} When the PEM to JWK conversion fails for any other reason
	 *
	 * @private
	 */

	private convertPemToJwk(): JwkEntry {
		try {
			const keyObject = createPublicKey({
				key: this.publicKey,
				format: 'pem',
				type: 'spki',
			});

			const jwt = keyObject.export({ format: 'jwk' });
			if (!jwt.n || !jwt.e) throw new InvalidRSAError('Invalid RSA public key - missing components');
			return {
				kty: 'RSA',
				kid: this.keyId,
				use: 'sig',
				alg: 'RS256',
				n: jwt.n,
				e: jwt.e,
			};
		} catch (error) {
			throw new Error(`Failed to convert PEM to JWK: ${getErrMessage(error)}`);
		}
	}

	/**
	 * Validates that the public key is present and in the correct PEM format.
	 *
	 * @throws {InvalidRSAError} If the public key is missing, empty, or not in PEM format.
	 * @private
	 */

	private validatePublicKey() {
		if (!this.publicKey || this.publicKey.trim().length === 0) throw new InvalidRSAError('Public key is required');

		if (!this.publicKey.includes('BEGIN PUBLIC KEY')) throw new InvalidRSAError('Invalid public key format - must be PEM encoded');
	}
}
