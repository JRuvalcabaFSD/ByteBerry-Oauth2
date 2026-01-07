import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IHashService, ILogger } from '@interfaces';
import type { CodeChallengeVO } from '@domain';
import { PkceVerifierUseCase } from '@application';

describe('PkceVerifierUseCase', () => {
	let pkceVerifier: PkceVerifierUseCase;
	let mockHashService: IHashService;
	let mockLogger: ILogger;
	let mockChallenge: CodeChallengeVO;

	beforeEach(() => {
		mockHashService = {
			verifySha256: vi.fn(),
		} as unknown as IHashService;

		mockLogger = {
			debug: vi.fn(),
			warn: vi.fn(),
		} as unknown as ILogger;

		mockChallenge = {
			getMethod: vi.fn(),
			getChallenge: vi.fn(),
			isPlainMethod: vi.fn(),
			verifyPlain: vi.fn(),
		} as unknown as CodeChallengeVO;

		pkceVerifier = new PkceVerifierUseCase(mockHashService, mockLogger);
	});

	it('should verify plain method successfully', () => {
		const verifier = 'test-verifier';
		vi.mocked(mockChallenge.isPlainMethod).mockReturnValue(true);
		vi.mocked(mockChallenge.verifyPlain).mockReturnValue(true);

		const result = pkceVerifier.verify(mockChallenge, verifier);

		expect(result).toBe(true);
		expect(mockChallenge.verifyPlain).toHaveBeenCalledWith(verifier);
		expect(mockLogger.debug).toHaveBeenCalled();
	});

	it('should verify SHA256 method successfully', () => {
		const verifier = 'test-verifier';
		const challenge = 'test-challenge';
		vi.mocked(mockChallenge.isPlainMethod).mockReturnValue(false);
		vi.mocked(mockChallenge.getChallenge).mockReturnValue(challenge);
		vi.mocked(mockHashService.verifySha256).mockReturnValue(true);

		const result = pkceVerifier.verify(mockChallenge, verifier);

		expect(result).toBe(true);
		expect(mockHashService.verifySha256).toHaveBeenCalledWith(verifier, challenge);
	});

	it('should return false when SHA256 verification fails', () => {
		const verifier = 'test-verifier';
		const challenge = 'test-challenge';
		vi.mocked(mockChallenge.isPlainMethod).mockReturnValue(false);
		vi.mocked(mockChallenge.getChallenge).mockReturnValue(challenge);
		vi.mocked(mockHashService.verifySha256).mockReturnValue(false);

		const result = pkceVerifier.verify(mockChallenge, verifier);

		expect(result).toBe(false);
		expect(mockLogger.warn).toHaveBeenCalledWith('PKCE verification failed - Hash mismatch');
	});

	it('should log debug information at verification start', () => {
		const verifier = 'test-verifier';
		const method = 'S256';
		const challenge = 'test-challenge';
		vi.mocked(mockChallenge.getMethod).mockReturnValue(method);
		vi.mocked(mockChallenge.getChallenge).mockReturnValue(challenge);
		vi.mocked(mockChallenge.isPlainMethod).mockReturnValue(false);
		vi.mocked(mockHashService.verifySha256).mockReturnValue(true);

		pkceVerifier.verify(mockChallenge, verifier);

		expect(mockLogger.debug).toHaveBeenCalledWith('PKCE verification start', {
			methods: method,
			challengeValue: challenge,
			verifierLength: verifier.length,
		});
	});
});
