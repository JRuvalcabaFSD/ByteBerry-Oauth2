import { RegisterUserRequestDTO, RegisterUserResponseDTO, UserResponseDTO } from '@application';

//TODO documentar
declare module '@ServiceMap' {
	interface ServiceMap {
		RegisterUserUseCase: IRegisterUserUseCase;
		GetUserUseCase: IGetUserUseCase;
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

/**
 * Use case interface for retrieving a user by their ID.
 * @interface IGetUserUseCase
 * @method execute - Fetches a user's information by ID and returns it as a DTO.
 * @param userId - The unique identifier of the user to retrieve.
 * @returns A promise that resolves to a UserResponseDTO containing the user's data.
 */

export interface IGetUserUseCase {
	execute(userId: string): Promise<UserResponseDTO>;
}
