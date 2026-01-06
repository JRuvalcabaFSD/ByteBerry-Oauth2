import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IJwksService, JwksResponse } from '@interfaces';
import { GetJwksUseCase } from '@application';

describe('GetJwksUseCase', () => {
	let getJwksUseCase: GetJwksUseCase;
	let mockJwksService: ReturnType<typeof vi.mocked<IJwksService>>;

	beforeEach(() => {
		mockJwksService = {
			getJwks: vi.fn(),
		} as unknown as ReturnType<typeof vi.mocked<IJwksService>>;

		getJwksUseCase = new GetJwksUseCase(mockJwksService);
	});

	it('should execute and return JWKS response', async () => {
		const mockJwksResponse: JwksResponse = {
			keys: [
				{
					kty: 'RSA',
					alg:"RS256",
					kid: 'test-key-id',
					use: 'sig',
					n: 'test-modulus',
					e: 'AQAB',
				},
			],
		};

		vi.mocked(mockJwksService.getJwks).mockResolvedValueOnce(mockJwksResponse);

		const result = await getJwksUseCase.execute();

		expect(result).toEqual(mockJwksResponse);
		expect(mockJwksService.getJwks).toHaveBeenCalledOnce();
	});

	it('should throw an error when JWKS retrieval fails', async () => {
		const error = new Error('JWKS retrieval failed');
		vi.mocked(mockJwksService.getJwks).mockRejectedValueOnce(error);

		await expect(getJwksUseCase.execute()).rejects.toThrow('JWKS retrieval failed');
		expect(mockJwksService.getJwks).toHaveBeenCalledOnce();
	});
});
