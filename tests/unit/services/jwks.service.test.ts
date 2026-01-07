import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JwksService } from '@infrastructure';
import type { IKeyLoader } from '@interfaces';
import { InvalidRSAError } from '@shared';

const VALID_RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtSzNEMldfhVf3PMEqD3u
hEjEpBy4icizyv0SixixzP3Ga7okhUx85EJ3nMltIr5hhrq/mlZhKDjX37pFaltA
MVgcEI7TDoaLqO8dXAo3gHyrlhG5X0Gb/Ztg3IrghOR21dCmheFKANAWHtq574dx
UV9k0ngM+48aGmN2/qrkbjkweES+4tvI1SMNi1rRKge77NnOdZQVnkdSGeQ11Fhv
SDI1xDxGo/lnhn6ASfP0hY7q36uW8jgNzhG7nQOVY1QLxvBlLglGgxkm6BInMz39
gb4BwQgXpW2OVHkK/XdaOjkKi1JkaTSCw3dKcKaZkC9a7vUu2UwpcWhTsws5/Dgn
MwIDAQAB
-----END PUBLIC KEY-----`;

const MOCK_KEY_ID = 'test-key-id';

describe('JwksService', () => {
	let jwksService: JwksService;
	let mockKeyLoader: IKeyLoader;

	beforeEach(() => {
		mockKeyLoader = {
			getPublicKey: vi.fn().mockReturnValue(VALID_RSA_PUBLIC_KEY),
			getKeyId: vi.fn().mockReturnValue(MOCK_KEY_ID),
		} as unknown as IKeyLoader;
	});

	describe('constructor', () => {
		it('should initialize with valid key loader', () => {
			expect(() => {
				jwksService = new JwksService(mockKeyLoader);
			}).not.toThrow();
		});

		it('should throw InvalidRSAError when public key is missing', () => {
			mockKeyLoader.getPublicKey = vi.fn().mockReturnValue('');
			expect(() => {
				new JwksService(mockKeyLoader);
			}).toThrow(InvalidRSAError);
		});

		it('should throw InvalidRSAError when public key is not PEM format', () => {
			mockKeyLoader.getPublicKey = vi.fn().mockReturnValue('invalid-key-format');
			expect(() => {
				new JwksService(mockKeyLoader);
			}).toThrow(InvalidRSAError);
		});

		it('should throw InvalidRSAError when public key is whitespace only', () => {
			mockKeyLoader.getPublicKey = vi.fn().mockReturnValue('   ');
			expect(() => {
				new JwksService(mockKeyLoader);
			}).toThrow(InvalidRSAError);
		});
	});

	describe('getJwks', () => {
		beforeEach(() => {
			jwksService = new JwksService(mockKeyLoader);
		});

		it('should return JWKS response with keys array', async () => {
			const result = await jwksService.getJwks();
			expect(result).toHaveProperty('keys');
			expect(Array.isArray(result.keys)).toBe(true);
			expect(result.keys.length).toBe(1);
		});

		it('should return cached JWKS on subsequent calls', async () => {
			const first = await jwksService.getJwks();
			const second = await jwksService.getJwks();
			expect(first).toBe(second);
		});

		it('should contain valid JWK entry with required fields', async () => {
			const result = await jwksService.getJwks();
			const jwk = result.keys[0];
			expect(jwk).toHaveProperty('kty', 'RSA');
			expect(jwk).toHaveProperty('kid', MOCK_KEY_ID);
			expect(jwk).toHaveProperty('use', 'sig');
			expect(jwk).toHaveProperty('alg', 'RS256');
			expect(jwk).toHaveProperty('n');
			expect(jwk).toHaveProperty('e');
		});
	});
});
