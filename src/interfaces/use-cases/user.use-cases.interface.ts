import { RegisterUserRequestDTO, RegisterUserResponseDTO } from '@application';

//TODO documentar
declare module '@ServiceMap' {
	interface ServiceMap {
		RegisterUserUseCase: IRegisterUserUseCase;
	}
}

/**
 * Use case interface for user registration.
 * Handles the execution of user registration logic and returns the registration response.
 *
 * @interface IRegisterUserUseCase
 *
 * @example
 * ```typescript
 * const registerUserUseCase: IRegisterUserUseCase = {
 *   execute: async (request) => {
 *     // registration logic
 *     return response;
 *   }
 * };
 * ```
 */

export interface IRegisterUserUseCase {
	execute(request: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO>;
}
