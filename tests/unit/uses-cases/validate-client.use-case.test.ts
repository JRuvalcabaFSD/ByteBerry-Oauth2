import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvalidClientError, HttpError } from '@shared';
import { ValidateClientUseCase } from '@application';
import type { IClientRepository, ILogger } from '@interfaces';
import type { ValidateClientRequestDto } from '@application';

describe('ValidateClientUseCase', () => {
	let useCase: ValidateClientUseCase;
	let mockRepository: IClientRepository;
	let mockLogger: ILogger;

	const mockClient = {
		id: 'client-id-123',
		clientId: 'test-client',
		clientSecret: 'secret-123',
		clientName: 'Test Client',
		isPublic: false,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: 'user-123',
		redirectUris: ['https://example.com/callback'],
		grantTypes: ['authorization_code'],
		isValidRedirectUri: vi.fn().mockReturnValue(true),
		supportsGrandType: vi.fn().mockReturnValue(true),
	};

	const validRequest: ValidateClientRequestDto = {
		clientId: 'test-client',
		redirectUri: 'https://example.com/callback',
		grantType: 'authorization_code',
	};

	beforeEach(() => {
		mockRepository = {
			findByClientId: vi.fn(),
		} as any;

		mockLogger = {
			debug: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as any;

		// Reset mockClient for each test
		mockClient.isValidRedirectUri = vi.fn().mockReturnValue(true);
		mockClient.supportsGrandType = vi.fn().mockReturnValue(true);

		useCase = new ValidateClientUseCase(mockRepository, mockLogger);
	});

	it('should validate client successfully', async () => {
		vi.mocked(mockRepository.findByClientId).mockResolvedValue(mockClient as unknown as any);

		const result = await useCase.execute(validRequest);

		expect(result).toEqual({
			clientId: 'test-client',
			clientName: 'Test Client',
			isPublic: false,
			redirectUris: ['https://example.com/callback'],
			grantTypes: ['authorization_code'],
		});
		expect(mockLogger.debug).toHaveBeenCalledWith('Validating OAuth client', { clientId: 'test-client' });
	});

	it('should throw InvalidClientError when client not found', async () => {
		vi.mocked(mockRepository.findByClientId).mockResolvedValue(null);

		await expect(useCase.execute(validRequest)).rejects.toThrow(InvalidClientError);
		expect(mockLogger.warn).toHaveBeenCalledWith('Client not found', { clientId: 'test-client' });
	});

	it('should throw InvalidClientError when redirect URI is invalid', async () => {
		mockClient.isValidRedirectUri.mockReturnValue(false);
		vi.mocked(mockRepository.findByClientId).mockResolvedValue(mockClient as unknown as any);

		await expect(useCase.execute(validRequest)).rejects.toThrow(InvalidClientError);
		expect(mockLogger.warn).toHaveBeenCalledWith('Invalid redirect URI', {
			clientId: 'test-client',
			redirectUri: 'https://example.com/callback',
		});
	});

	it('should throw InvalidClientError when grant type is unsupported', async () => {
		mockClient.supportsGrandType.mockReturnValue(false);
		vi.mocked(mockRepository.findByClientId).mockResolvedValue(mockClient as unknown as any);

		await expect(useCase.execute(validRequest)).rejects.toThrow(InvalidClientError);
		expect(mockLogger.warn).toHaveBeenCalledWith('Unsupported grand type', {
			clientId: 'test-client',
			grandType: 'authorization_code',
		});
	});

	it('should log error when unexpected error occurs', async () => {
		const unexpectedError = new Error('Database error');
		vi.mocked(mockRepository.findByClientId).mockRejectedValue(unexpectedError);

		await expect(useCase.execute(validRequest)).rejects.toThrow(Error);
		expect(mockLogger.error).toHaveBeenCalled();
	});

	it('should not log unexpected error when error is HttpError', async () => {
		const httpError = new HttpError('Not Found', 'http', 'CLIENT_NOT_FOUND', 404);
		vi.mocked(mockRepository.findByClientId).mockRejectedValue(httpError);

		await expect(useCase.execute(validRequest)).rejects.toThrow(HttpError);
		expect(mockLogger.error).not.toHaveBeenCalled();
	});
});
