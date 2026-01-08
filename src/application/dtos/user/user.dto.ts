import { UserEntity } from '@domain';
import { ValidateRequestError } from '@shared';
import { formattedZodError, RegisterUserRequestData, UserRegisterSchema } from '@application';

/**
 * Represents the user data returned in the "me" endpoint response.
 *
 * @property id - Unique identifier for the user.
 * @property email - User's email address.
 * @property username - User's username, or null if not set.
 * @property fullName - User's full name, or null if not set.
 * @property roles - Array of roles assigned to the user.
 * @property isActive - Indicates whether the user account is active.
 * @property emailVerified - Indicates whether the user's email has been verified.
 * @property createdAt - Date when the user account was created.
 */

interface UserData {
	id: string;
	email: string;
	username: string | null;
	fullName: string | null;
	roles: string[];
	isActive: boolean;
	emailVerified: boolean;
	createdAt: Date;
}

/**
 * Represents the response data structure for the "me" user endpoint.
 * @property user - The user data associated with the current authenticated user.
 */

interface UserResponseData {
	user: UserData;
}

/**
 * Data Transfer Object (DTO) representing the response structure for the "me" user endpoint.
 *
 * Encapsulates the public user data to be sent to the client, ensuring sensitive fields are omitted.
 * Provides static and instance methods for transforming user entities and serializing the response.
 *
 * @remarks
 * - Use `UserMeResponseDTO.fromEntity` to create an instance from a `UserEntity`.
 * - The `toJSON` method serializes the `createdAt` field to an ISO string.
 *
 * @example
 * ```typescript
 * const dto = UserMeResponseDTO.fromEntity(userEntity);
 * return dto.toJSON();
 * ```
 */

/**
 * Represents a user entity with authentication and profile information.
 *
 * @property id - Unique identifier for the user.
 * @property email - The user's email address.
 * @property username - The user's username, or null if not set.
 * @property fullName - The user's full name, or null if not set.
 * @property roles - Array of roles assigned to the user.
 * @property isActive - Indicates if the user account is active.
 * @property emailVerified - Indicates if the user's email has been verified.
 * @property createdAt - The date and time when the user was created.
 */

interface User {
	id: string;
	email: string;
	username: string | null;
	fullName: string | null;
	roles: string[];
	isActive: boolean;
	emailVerified: boolean;
	createdAt: Date;
}

/**
 * Represents the response data returned after a user registration operation.
 *
 * @property user - The registered user information.
 * @property message - A message describing the result of the registration process.
 */

interface RegisterUserResponseData {
	user: User;
	message: string;
}

/**
 * Data Transfer Object (DTO) representing the authenticated user's profile information.
 *
 * The `UserMeResponseDTO` encapsulates the public data of a user, typically used for
 * returning the current user's information in API responses. It provides a static
 * factory method to create an instance from a `UserEntity`, ensuring only the intended
 * fields are exposed, and includes serialization logic to format date fields appropriately.
 *
 * @remarks
 * - The `user` property contains the user's public data, including status and verification fields.
 * - Use `fromEntity` to construct an instance from a domain entity.
 * - Use `toJSON` to serialize the DTO for API responses.
 */

export class UserResponseDTO {
	public readonly user!: UserData;

	private constructor(data: UserResponseData) {
		Object.assign(this, data);
	}

	/**
	 * Creates a new instance of `UserMeResponseDTO` from a given `UserEntity`.
	 * Maps the public properties of the user entity and includes additional fields
	 * such as `isActive`, `emailVerified`, and `createdAt`.
	 *
	 * @param user - The user entity to convert.
	 * @returns A new `UserMeResponseDTO` instance populated with user data.
	 */

	public static fromEntity(user: UserEntity): UserResponseDTO {
		return new UserResponseDTO({
			user: {
				...user.toPublic(),
				isActive: user.isActive,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
			},
		});
	}

	/**
	 * Serializes the user data to a JSON-compatible object, converting the `createdAt` property
	 * to an ISO string format.
	 *
	 * @returns An object containing the user data, with `createdAt` as a string.
	 */

	public toJSON(): { user: Omit<UserData, 'createdAt'> & { createdAt: string } } {
		return {
			user: {
				...this.user,
				createdAt: this.user.createdAt.toISOString(),
			},
		};
	}
}

/**
 * Data Transfer Object for user registration requests.
 *
 * This DTO encapsulates and validates the data required to register a new user,
 * including email, username, password, full name, and optional IP address.
 *
 * Use the static `fromBody` method to create an instance from a request body,
 * which performs validation and throws a `ValidateRequestError` if any field is invalid.
 *
 * @remarks
 * - The `email` and `password` fields are required.
 * - The `username` and `fullName` fields are optional, but have length and format constraints.
 * - The `ipAddress` field is optional and typically set from the request context.
 *
 * @example
 * ```typescript
 * const dto = RegisterRequestDTO.fromBody(req.body, req.ip);
 * ```
 */

export class RegisterUserRequestDTO {
	public readonly email!: string;
	public readonly username!: string;
	public readonly password!: string;
	public readonly fullName?: string;
	public readonly ipAddress?: string;

	private constructor(data: RegisterUserRequestData) {
		Object.assign(this, data);
	}

	/**
	 * Creates a new instance of `RegisterRequestDTO` from the provided request body.
	 *
	 * Validates the input fields (`email`, `password`, `username`, and `fullName`) and throws a `ValidateRequestError`
	 * if any validation fails. The method ensures that required fields are present and conform to expected formats and lengths.
	 *
	 * @param body - The request body containing user registration data as key-value pairs.
	 * @param ip - (Optional) The IP address of the user making the request.
	 * @returns A new `RegisterRequestDTO` instance populated with validated and sanitized data.
	 * @throws {ValidateRequestError} If required fields are missing or validation fails for any field.
	 */

	public static fromBody(body: Record<string, string>, ip?: string): RegisterUserRequestDTO {
		const result = UserRegisterSchema.safeParse({ ...body, ip });

		if (!result.success) {
			const resp = formattedZodError(result.error, 'form');
			throw new ValidateRequestError(resp.msg, resp.errors);
		}

		return new RegisterUserRequestDTO(result.data);
	}

	private static isValidUsername(username: string): boolean {
		const usernameRegex = /^[a-zA-Z0-9_-]+$/;
		return usernameRegex.test(username);
	}

	private static isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

/**
 * Data Transfer Object representing the response after a user registration.
 *
 * @remarks
 * This DTO encapsulates the registered user's public information and a message indicating the registration status.
 * It provides a static factory method to create an instance from a `UserEntity` and a method to serialize the response to JSON,
 * ensuring the `createdAt` property is formatted as an ISO string.
 *
 * @property user - The public representation of the registered user.
 * @property message - A message describing the registration result.
 *
 * @method fromEntity - Creates a `RegisterUserResponseDTO` from a `UserEntity`.
 * @method toJSON - Serializes the DTO to a JSON object, formatting `createdAt` as an ISO string.
 */

export class RegisterUserResponseDTO {
	public readonly user!: User;
	public readonly message!: string;

	private constructor(data: RegisterUserResponseData) {
		Object.assign(this, { ...data, message: data.message ?? 'User registered successfully' });
	}

	/**
	 * Creates a new instance of `RegisterUserResponseDTO` from a given `UserEntity`.
	 *
	 * This method extracts public user information using `toPublic()`, and includes
	 * additional properties such as `isActive`, `emailVerified`, and `createdAt`.
	 * It also sets a default success message.
	 *
	 * @param user - The `UserEntity` instance to convert.
	 * @returns A `RegisterUserResponseDTO` containing the user's public data and a success message.
	 */

	public static fromEntity(user: UserEntity): RegisterUserResponseDTO {
		return new RegisterUserResponseDTO({
			user: {
				...user.toPublic(),
				isActive: user.isActive,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
			},
			message: 'User registered successfully',
		});
	}

	/**
	 * Converts the current instance to a JSON-serializable object.
	 *
	 * @returns An object containing the user data with the `createdAt` property as an ISO string,
	 *          and a message string.
	 *
	 * The returned `user` object omits the original `createdAt` property (as a Date)
	 * and replaces it with its ISO string representation.
	 */

	public toJSON(): { user: Omit<User, 'createdAt'> & { createdAt: string }; message: string } {
		return {
			user: {
				...this.user,
				createdAt: this.user.createdAt.toISOString(),
			},
			message: this.message,
		};
	}
}
