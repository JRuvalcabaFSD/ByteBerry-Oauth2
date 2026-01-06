import { describe, it, expect, vi } from 'vitest';
import { ValidateRequestError } from '@shared';
import { CodeRequestDTO, CodeResponseDTO } from '@application';

describe('CodeRequestDTO', () => {

	describe('fromQuery', () => {
		it('should create a CodeRequestDTO instance with valid query parameters', () => {
			const validQuery = {
				client_id: 'test-client',
				redirect_uri: 'https://example.com/callback',
				response_type: 'code',
				code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
				code_challenge_method: 'S256',
				state: 'random-state',
				scope: 'read write',
			};

			const dto = CodeRequestDTO.fromQuery(validQuery);

			expect(dto).toBeInstanceOf(CodeRequestDTO);
			expect(dto.clientId).toBe('test-client');
			expect(dto.redirectUri).toBe('https://example.com/callback');
			expect(dto.state).toBe('random-state');
		});

		it('should throw ValidateRequestError when validation fails', () => {
			const invalidQuery = { client_id: 'test' };

			expect(() => CodeRequestDTO.fromQuery(invalidQuery)).toThrow(ValidateRequestError);
		});

		it('should handle optional state parameter', () => {
			const queryWithoutState = {
				client_id: 'test-client',
				redirect_uri: 'https://example.com/callback',
				response_type: 'code',
				code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
				code_challenge_method: 'S256',
			};

			const dto = CodeRequestDTO.fromQuery(queryWithoutState);

			expect(dto.state).toBeUndefined();
		});

		it('should handle both S256 and plain code challenge methods', () => {
			const queryPlain = {
				client_id: 'test-client',
				redirect_uri: 'https://example.com/callback',
				response_type: 'code',
				code_challenge: 'abcdefghijklmnopqrstuvwxyz01234567890ABCDEF',
				code_challenge_method: 'plain',
			};

			const dto = CodeRequestDTO.fromQuery(queryPlain);

			expect(dto.codeChallengeMethod).toBe('plain');
		});

		it('should include all properties in the created DTO instance', () => {
			const validQuery = {
				client_id: 'test-client',
				redirect_uri: 'https://example.com/callback',
				response_type: 'code',
				code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
				code_challenge_method: 'S256',
				state: 'state-value',
				scope: 'read write',
			};

			const dto = CodeRequestDTO.fromQuery(validQuery);

			expect(dto.clientId).toBe('test-client');
			expect(dto.redirectUri).toBe('https://example.com/callback');
			expect(dto.responseType).toBe('code');
			expect(dto.codeChallenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
			expect(dto.codeChallengeMethod).toBe('S256');
			expect(dto.scope).toBe('read write');
		});

		describe('CodeResponseDTO', () => {
			describe('buildRedirectURrl', () => {
				it('should build redirect URL with code parameter', () => {
					const dto = new CodeResponseDTO('auth_code_123');
					const redirectUrl = dto.buildRedirectURrl('https://example.com/callback');

					expect(redirectUrl).toBe('https://example.com/callback?code=auth_code_123');
				});

				it('should build redirect URL with code and state parameters', () => {
					const dto = new CodeResponseDTO('auth_code_123', 'random_state');
					const redirectUrl = dto.buildRedirectURrl('https://example.com/callback');

					expect(redirectUrl).toBe('https://example.com/callback?code=auth_code_123&state=random_state');
				});

				it('should handle redirect URI with existing query parameters', () => {
					const dto = new CodeResponseDTO('auth_code_123', 'state_value');
					const redirectUrl = dto.buildRedirectURrl('https://example.com/callback?existing=param');

					expect(redirectUrl).toContain('code=auth_code_123');
					expect(redirectUrl).toContain('state=state_value');
					expect(redirectUrl).toContain('existing=param');
				});

				it('should encode special characters in code and state', () => {
					const dto = new CodeResponseDTO('code+with/special=chars', 'state&with?special');
					const redirectUrl = dto.buildRedirectURrl('https://example.com/callback');

					expect(redirectUrl).toBeDefined();
					expect(redirectUrl).toContain('https://example.com/callback');
				});

				it('should not include state parameter if undefined', () => {
					const dto = new CodeResponseDTO('auth_code_123');
					const redirectUrl = dto.buildRedirectURrl('https://example.com/callback');

					expect(redirectUrl).not.toContain('state=');
				});

				it('should return a valid URL string', () => {
					const dto = new CodeResponseDTO('code_123', 'state_456');
					const redirectUrl = dto.buildRedirectURrl('https://example.com/callback');

					expect(() => new URL(redirectUrl)).not.toThrow();
				});
			});
		});
	});
});
