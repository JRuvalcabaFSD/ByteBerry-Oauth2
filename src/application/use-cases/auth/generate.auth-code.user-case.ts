import { randomBytes } from 'crypto';

import { CodeRequestDTO, CodeResponseDTO } from '@application';
import { AppError, ClientIdVO, CodeChallengeVO, CodeEntity } from '@domain';
import { getErrMessage, Injectable, LogContextClass, LogContextMethod } from '@shared';
import type { ICodeRepository, IConfig, IGenerateAuthCodeUseCase, ILogger, IValidateClientUseCase } from '@interfaces';

/**
 * Use case for generating OAuth 2.0 authorization codes.
 *
 * This use case handles the generation of authorization codes as part of the OAuth 2.0
 * authorization code flow. It validates the client, creates a secure authorization code,
 * and stores it with associated metadata including PKCE challenge information.
 *
 * @remarks
 * The authorization code has a configurable expiration time (default: 1 minute) and is
 * generated using cryptographically secure random bytes. The code is associated with
 * a specific user, client, and optional PKCE code challenge for enhanced security.
 *
 * @example
 * ```typescript
 * const useCase = new GenerateAuthCodeUseCase(
 *   codeRepository,
 *   validateClientUseCase,
 *   logger,
 *   config
 * );
 *
 * const response = await useCase.execute(userId, {
 *   clientId: 'my-client-id',
 *   redirectUri: 'https://example.com/callback',
 *   codeChallenge: 'challenge-string',
 *   codeChallengeMethod: 'S256',
 *   state: 'random-state'
 * });
 * ```
 */

@LogContextClass()
@Injectable({ name: 'GenerateCodeUseCase', depends: ['CodeRepository', 'ValidateClientUseCase', 'Logger', 'Config'] })
export class GenerateAuthCodeUseCase implements IGenerateAuthCodeUseCase {
	private readonly expirationMinutes: number;

	constructor(
		private readonly repository: ICodeRepository,
		private readonly validateClient: IValidateClientUseCase,
		private readonly logger: ILogger,
		readonly config: IConfig
	) {
		this.expirationMinutes = config.oauth2AuthCodeExpiresIn ?? 1;
	}
	/**
	 * Generates an authorization code for OAuth2 authorization code flow.
	 *
	 * This method validates the client credentials, creates a secure authorization code,
	 * and stores it in the repository with an expiration time.
	 *
	 * @param userId - The unique identifier of the user granting authorization
	 * @param request - The code request data containing client credentials and PKCE parameters
	 * @returns A promise that resolves to a CodeResponseDTO containing the generated code and state
	 *
	 * @throws {AppError} When client validation fails or repository operations fail
	 * @throws {Error} When an unexpected error occurs during code generation
	 *
	 * @remarks
	 * - Validates client ID, redirect URI, and grant type before generating the code
	 * - Generates a cryptographically secure random 32-byte code encoded in base64
	 * - Supports PKCE (Proof Key for Code Exchange) with code challenge validation
	 * - Logs the authorization flow for debugging and security auditing
	 * - The generated code expires after the configured expiration time
	 */

	@LogContextMethod()
	public async execute(userId: string, request: CodeRequestDTO): Promise<CodeResponseDTO> {
		this.logger.debug('Generating authorization code', { userId, clientId: request });

		try {
			// Validate and obtain customer information
			const clientInfo = await this.validateClient.execute({
				clientId: request.clientId,
				redirectUri: request.redirectUri,
				grantType: 'authorization_code',
			});

			this.logger.debug('Client validated for authorization', {
				clientId: clientInfo.clientId,
				redirectUri: clientInfo.redirectUris,
				grandType: clientInfo.grantTypes,
			});

			// Generate clientId and codeChallenge
			const clientId = ClientIdVO.create(clientInfo.clientId);
			const codeChallenge = CodeChallengeVO.create(request.codeChallenge, request.codeChallengeMethod);

			const code = randomBytes(32).toString('base64');

			//Generate the entity
			const authCode = CodeEntity.create({
				...request,
				code,
				clientId,
				userId,
				codeChallenge,
				expirationMinutes: this.expirationMinutes,
			});

			// Save the entity
			await this.repository.save(authCode);

			// Return authorization object
			this.logger.debug('Authorization code generated', {
				userId,
				clientId: request.clientId,
				code: code.substring(0, 8) + '...', // Log only prefix for security
				expiresAt: authCode.expiresAt.toISOString(),
			});

			return new CodeResponseDTO(code, request.state);
		} catch (error) {
			if (!(error instanceof AppError)) {
				this.logger.error('Unexpected error generating authorization code', { error: getErrMessage(error), client_id: request.clientId });
			}

			throw error;
		}
	}
}
