import { CodeRequestDTO, CodeResponseDTO, LoginRequestDTO, LoginResponseDTO } from '@application';

/**
 * Extends the global ServiceMap interface to include the IConfig interface.
 * This allows for type-safe access to configuration settings throughout the application.
 * @module @ServiceMap
 * @interface ServiceMap
 */

declare module '@ServiceMap' {
	interface ServiceMap {
		LoginUseCase: ILoginUseCase;
		GenerateCodeUseCase: IGenerateAuthCodeUseCase;
	}
}

/**
 * Use case interface for user login operations.
 *
 * @remarks
 * This interface defines the contract for executing login functionality,
 * accepting login credentials and returning authentication tokens or user session data.
 *
 * @method execute - Executes the login process with the provided request data.
 * @param request - The login request data transfer object containing user credentials.
 * @returns A promise that resolves to the login response data transfer object.
 *
 * @public
 */
export interface ILoginUseCase {
	execute(request: LoginRequestDTO): Promise<LoginResponseDTO>;
}

/**
 * Use case interface for generating OAuth 2.0 authorization codes.
 *
 * @remarks
 * This interface defines the contract for generating authorization codes in the OAuth 2.0 flow.
 * The authorization code is typically generated during the authorization step and later exchanged
 * for access tokens.
 *
 * @interface IGenerateAuthCodeUseCase
 */

export interface IGenerateAuthCodeUseCase {
	execute(userId: string, request: CodeRequestDTO): Promise<CodeResponseDTO>;
}
