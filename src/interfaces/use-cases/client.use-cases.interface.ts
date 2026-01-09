import * as Dtos from '@application';

/**
 * Extends the global ServiceMap interface to include the IConfig interface.
 * This allows for type-safe access to configuration settings throughout the application.
 * @module @ServiceMap
 * @interface ServiceMap
 */

declare module '@ServiceMap' {
	interface ServiceMap {
		ValidateClientUseCase: IValidateClientUseCase;
		CreateClientUseCase: ICreateClientUseCase;
		ListClientUseCase: IListClientUseCase;
	}
}

/**
 * Use case interface for validating OAuth2 client credentials.
 *
 * @interface IValidateClientUseCase
 *
 * @remarks
 * This interface defines the contract for validating client credentials
 * in an OAuth2 authentication flow. Implementations should verify the
 * client's identity and authorization.
 *
 * @method execute - Validates the client credentials
 * @param {ValidateClientRequestDto} data - The data required for client validation
 * @returns {Promise<ValidateClientResponseDto>} - A promise that resolves to the validation result
 *
 * @example
 * ```typescript
 * class ValidateClientUseCase implements IValidateClientUseCase {
 *   async execute(data: ValidateClientRequestDto): Promise<ValidateClientResponseDto> {
 *     // Validation logic here
 *   }
 * }
 * ```
 */

export interface IValidateClientUseCase {
	execute(data: Dtos.ValidateClientRequestDto): Promise<Dtos.ValidateClientResponseDto>;
}

/**
 * Use case for creating a new OAuth2 client.
 *
 * @interface ICreateClientUseCase
 * @method execute - Creates a new client for the specified user.
 * @param userId - The unique identifier of the user creating the client.
 * @param request - The client creation request containing necessary configuration details.
 * @returns A promise that resolves to the created client response with client credentials and metadata.
 */

export interface ICreateClientUseCase {
	execute(userId: string, request: Dtos.CreateClientRequestDTO): Promise<Dtos.CreateClientResponseDTO>;
}

/**
 * Use case interface for listing clients associated with a user.
 *
 * @interface IListClientUseCase
 *
 * @method execute
 * @param {string} userId - The unique identifier of the user whose clients are to be listed.
 * @returns {Promise<ListClientResponseDTO>} A promise that resolves to a DTO containing the list of clients for the specified user.
 *
 * @example
 * const listClientUseCase: IListClientUseCase = new ListClientUseCase();
 * const result = await listClientUseCase.execute('user-123');
 */

export interface IListClientUseCase {
	execute(userId: string): Promise<Dtos.ListClientResponseDTO>;
}
