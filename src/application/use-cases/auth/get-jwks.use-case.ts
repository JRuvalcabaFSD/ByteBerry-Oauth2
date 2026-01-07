import type { IGetJwksUseCase, IJwksService, JwksResponse } from '@interfaces';
import { Injectable } from '@shared';

/**
 * Use case for retrieving JSON Web Key Set (JWKS).
 *
 * This use case acts as an intermediary between the application layer and the service layer,
 * delegating the responsibility of fetching JWKS to the injected JWKS service.
 *
 * @remarks
 * This class follows the Single Responsibility Principle by focusing solely on
 * orchestrating the retrieval of JWKS data.
 *
 * @example
 * ```typescript
 * const jwksService = new JwksService();
 * const getJwksUseCase = new GetJwksUseCase(jwksService);
 * const jwks = await getJwksUseCase.execute();
 * ```
 */

@Injectable({ name: 'GetJwksUseCase', depends: ['JwksService'] })
export class GetJwksUseCase implements IGetJwksUseCase {
	constructor(private readonly service: IJwksService) {}

	/**
	 * Executes the JWKS retrieval use case.
	 *
	 * This method retrieves the JSON Web Key Set (JWKS) from the authentication service,
	 * which contains the public keys used to verify JWT signatures.
	 *
	 * @returns A promise that resolves to a JwksResponse containing the JWKS data.
	 * @throws May throw an error if the JWKS retrieval fails.
	 */

	public async execute(): Promise<JwksResponse> {
		return await this.service.getJwks();
	}
}
