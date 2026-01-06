import { describe, it, expect, vi } from 'vitest';
import { ValidateRequestError } from '@shared';
import { TokenRequestDTO, TokenResponseDTO } from '@application';

describe('TokenRequestDTO', () => {
	describe('fromBody', () => {
		it('should create a TokenRequestDTO with valid data', () => {
			const validBody = {
				grant_type: 'authorization_code',
				code: 'auth_code_123',
				redirect_uri: 'https://example.com/callback',
				client_id: 'client_123',
				code_verifier: 'verifier_abc',
			};

			const dto = TokenRequestDTO.fromBody(validBody);

			expect(dto.grantType).toBe('authorization_code');
			expect(dto.code).toBe('auth_code_123');
			expect(dto.redirectUri).toBe('https://example.com/callback');
			expect(dto.clientId).toBe('client_123');
			expect(dto.codeVerifier).toBe('verifier_abc');
		});

		it('should throw ValidateRequestError when validation fails', () => {
			const invalidBody = { grant_type: '' };

			expect(() => TokenRequestDTO.fromBody(invalidBody)).toThrow(ValidateRequestError);
		});
	});
});

describe('TokenResponseDTO', () => {
	describe('create', () => {
		it('should create a TokenResponseDTO with valid data', () => {
			const tokenData = {
				accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				expiresIn: 3600,
				scope: 'read write',
			};

			const dto = TokenResponseDTO.create(tokenData);

			expect(dto).toBeInstanceOf(TokenResponseDTO);
		});
	});

	describe('toJson', () => {
		it('should convert token data to JSON with correct property names', () => {
			const tokenData = {
				accessToken: 'token_abc123',
				expiresIn: 7200,
				scope: 'read',
			};

			const dto = TokenResponseDTO.create(tokenData);
			const json = dto.toJson();

			expect(json.access_token).toBe('token_abc123');
			expect(json.token_type).toBe('Bearer');
			expect(json.expires_in).toBe(7200);
			expect(json.scope).toBe('read');
		});

		it('should always set token_type to Bearer', () => {
			const tokenData = {
				accessToken: 'token_xyz',
				expiresIn: 1800,
				scope: 'write',
			};

			const dto = TokenResponseDTO.create(tokenData);
			const json = dto.toJson();

			expect(json.token_type).toBe('Bearer');
		});

		it('should return properly formatted OAuth2 token response', () => {
			const tokenData = {
				accessToken: 'access_token_value',
				expiresIn: 3600,
				scope: 'read write delete',
			};

			const dto = TokenResponseDTO.create(tokenData);
			const json = dto.toJson();

			expect(json).toEqual({
				access_token: 'access_token_value',
				token_type: 'Bearer',
				expires_in: 3600,
				scope: 'read write delete',
			});
		});
	});
});
