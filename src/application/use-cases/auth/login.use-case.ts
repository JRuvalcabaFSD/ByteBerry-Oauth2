import { SessionEntity } from '@domain';
import { Injectable, InvalidCredentialsError, LogContextClass, LogContextMethod, LoginError } from '@shared';
import { LoginRequestDTO, LoginResponseDTO } from '@application';
import type { ILogger, ILoginUseCase, ISessionRepository, IUserRepository, IUuid } from '@interfaces';

/**
 * Use case responsible for handling user authentication and session creation.
 *
 * This class implements the login workflow by validating user credentials,
 * checking user account status, and creating authenticated sessions with
 * configurable time-to-live (TTL) values.
 *
 * @remarks
 * The use case supports two session duration modes:
 * - Default: 1 hour (3600 seconds)
 * - Extended: 30 days (2,592,000 seconds) when "remember me" is enabled
 *
 * @example
 * ```typescript
 * const loginUseCase = new LoginUseCase(
 *   userRepository,
 *   sessionRepository,
 *   uuidGenerator,
 *   logger
 * );
 *
 * const response = await loginUseCase.execute({
 *   emailOrUserName: 'user@example.com',
 *   password: 'securePassword',
 *   rememberMe: true,
 *   ipAddress: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...'
 * });
 * ```
 *
 * @throws {InvalidCredentialsError} When the provided credentials are invalid
 * @throws {LoginError} When the user account is inactive or cannot login
 */

@LogContextClass()
@Injectable({ name: 'LoginUseCase', depends: ['UserRepository', 'SessionRepository', 'Uuid', 'Logger'] })
export class LoginUseCase implements ILoginUseCase {
	private readonly DEFAULT_SESSION_TTL = 3600;
	private readonly EXTENDED_SESSION_TTL = 30 * 24 * 3600;

	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly uuid: IUuid,
		private readonly logger: ILogger
	) {}

	/**
	 * Executes the login use case by validating user credentials and creating a session.
	 *
	 * @param request - The login request containing user credentials and session preferences
	 * @param request.emailOrUserName - The user's email or username
	 * @param request.password - The user's password
	 * @param request.rememberMe - Whether to extend the session duration
	 * @param request.ipAddress - The IP address of the login attempt
	 * @param request.userAgent - The user agent string from the login request
	 *
	 * @returns A promise that resolves to a LoginResponseDTO containing user and session data
	 *
	 * @throws {InvalidCredentialsError} When the provided credentials are invalid
	 * @throws {LoginError} When the user account is inactive or cannot login
	 *
	 * @remarks
	 * This method performs the following steps:
	 * 1. Validates the provided credentials against the user repository
	 * 2. Checks if the user account is active and can login
	 * 3. Creates a new session with appropriate TTL based on rememberMe preference
	 * 4. Saves the session to the repository
	 * 5. Returns user and session information
	 *
	 * The session TTL is determined by the rememberMe flag:
	 * - Extended session TTL if rememberMe is true
	 * - Default session TTL otherwise
	 */

	@LogContextMethod()
	public async execute(request: LoginRequestDTO): Promise<LoginResponseDTO> {
		this.logger.debug('Login attempt', {
			emailOrPassword: request.emailOrUserName,
			rememberMe: request.rememberMe,
			ipAddress: request.ipAddress,
		});

		//validate the credentials and obtain the user
		const user = await this.userRepository.validateCredentials(request.emailOrUserName, request.password);

		if (!user) {
			this.logger.warn('Login failed - invalid credentials', {
				emailOrPassword: request.emailOrUserName,
				ipAddress: request.ipAddress,
			});
			throw new InvalidCredentialsError('Invalid email/username or password');
		}

		//validate if the user is active
		if (!user.canLogin()) {
			this.logger.warn('Login failed - user inactive');
			throw new LoginError('User account is inactive');
		}

		//Generate the session
		const sessionTTl = request.rememberMe ? this.EXTENDED_SESSION_TTL : this.DEFAULT_SESSION_TTL;

		const session = SessionEntity.create({
			id: this.uuid.generate(),
			userId: user.id,
			ttlSeconds: sessionTTl,
			userAgent: request.userAgent ?? null,
			ipAddress: request.ipAddress ?? null,
			metadata: {
				loginMethod: 'password',
				rememberMe: request.rememberMe,
				loginAt: new Date().toISOString(),
			},
			createdAt: undefined,
			expiresAt: undefined,
		});

		//Save the session to the database.
		await this.sessionRepository.save(session);

		this.logger.debug('Login successful', {
			userId: user.id,
			email: user.email,
			sessionId: session.id,
			expiresAt: session.expiresAt.toISOString(),
			rememberMe: request.rememberMe,
		});

		//Return user and session data
		return LoginResponseDTO.fromEntities(user, session);
	}
}
