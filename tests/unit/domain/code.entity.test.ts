import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClientIdVO, CodeChallengeVO, CodeEntity } from '@domain';

describe('CodeEntity', () => {
	let mockClientId: ClientIdVO;
	let mockCodeChallenge: CodeChallengeVO;

	beforeEach(() => {
		mockClientId = { value: 'test-client-id' } as unknown as ClientIdVO;
		mockCodeChallenge = { value: 'test-challenge' } as unknown as CodeChallengeVO;
	});

	describe('create', () => {
		it('should create a CodeEntity with default expiration of 1 minute', () => {
			const params = {
				code: 'auth-code-123',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			};

			const entity = CodeEntity.create(params);

			expect(entity.code).toBe('auth-code-123');
			expect(entity.userId).toBe('user-123');
			expect(entity.clientId).toBe(mockClientId);
			expect(entity.redirectUri).toBe('https://example.com/callback');
			expect(entity.codeChallenge).toBe(mockCodeChallenge);
		});

		it('should create a CodeEntity with custom expiration minutes', () => {
			const params = {
				code: 'auth-code-456',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 10,
			};

			const entity = CodeEntity.create(params);
			const expectedExpiration = new Date();
			expectedExpiration.setMinutes(expectedExpiration.getMinutes() + 10);

			expect(entity.expiresAt.getMinutes()).toBe(expectedExpiration.getMinutes());
		});

		it('should include optional scope and state properties', () => {
			const params = {
				code: 'auth-code-789',
				userId: 'user-789',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				scope: 'read write',
				state: 'state-value-123',
			};

			const entity = CodeEntity.create(params);

			expect(entity.scope).toBe('read write');
			expect(entity.state).toBe('state-value-123');
		});
	});

	describe('isUsed', () => {
		it('should return false for a newly created code', () => {
			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			});

			expect(entity.isUsed()).toBe(false);
		});

		it('should return true after markAsUsed is called', () => {
			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			});

			entity.markAsUsed();

			expect(entity.isUsed()).toBe(true);
		});
	});

	describe('isExpired', () => {
		it('should return false for a code that has not expired', () => {
			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 10,
			});

			expect(entity.isExpired()).toBe(false);
		});

		it('should return true for an expired code', () => {
			vi.useFakeTimers();
			const now = new Date();
			vi.setSystemTime(now);

			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 1,
			});

			vi.advanceTimersByTime(61 * 1000);

			expect(entity.isExpired()).toBe(true);

			vi.useRealTimers();
		});
	});

	describe('markAsUsed', () => {
		it('should set the used flag to true', () => {
			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			});

			entity.markAsUsed();

			expect(entity.isUsed()).toBe(true);
		});
	});

	describe('isValid', () => {
		it('should return true for a valid code', () => {
			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 10,
			});

			expect(entity.isValid()).toBe(true);
		});

		it('should return false when code has been used', () => {
			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 10,
			});

			entity.markAsUsed();

			expect(entity.isValid()).toBe(false);
		});

		it('should return false when code has expired', () => {
			vi.useFakeTimers();
			const now = new Date();
			vi.setSystemTime(now);

			const entity = CodeEntity.create({
				code: 'auth-code',
				userId: 'user-123',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 1,
			});

			vi.advanceTimersByTime(61 * 1000);

			expect(entity.isValid()).toBe(false);

			vi.useRealTimers();
		});
	});
});
