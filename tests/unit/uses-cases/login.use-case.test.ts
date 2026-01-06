import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvalidCredentialsError, LoginError } from '@shared';
import { LoginRequestDTO, LoginResponseDTO, LoginUseCase } from '@application';
import type { ILogger, ISessionRepository, IUserRepository, IUuid } from '@interfaces';

describe('LoginUseCase', () => {
	let loginUseCase: LoginUseCase;
	let userRepository: IUserRepository;
	let sessionRepository: ISessionRepository;
	let uuid: IUuid;
	let logger: ILogger;

	beforeEach(() => {
		userRepository = {
			validateCredentials: vi.fn(),
		} as unknown as IUserRepository;

		sessionRepository = {
			save: vi.fn(),
		} as unknown as ISessionRepository;

		uuid = {
			generate: vi.fn().mockReturnValue('session-uuid-123'),
		} as unknown as IUuid;

		logger = {
			debug: vi.fn(),
			warn: vi.fn(),
		} as unknown as ILogger;

		loginUseCase = new LoginUseCase(userRepository, sessionRepository, uuid, logger);
	});

	it('should successfully login and return session with default TTL', async () => {
		const user = {
			id: 'user-123',
			email: 'user@example.com',
			username: 'user123',
			fullName: 'User Example',
			roles: ['user'],
			isActive: true,
			emailVerified: true,
			canLogin: vi.fn().mockReturnValue(true),
			toPublic: vi.fn().mockReturnValue({
				id: 'user-123',
				email: 'user@example.com',
				username: 'user123',
				fullName: 'User Example',
				roles: ['user'],
				isActive: true,
				emailVerified: true,
			}),
		};

		const request: LoginRequestDTO = {
			emailOrUserName: 'user@example.com',
			password: 'password123',
			rememberMe: false,
			ipAddress: '192.168.1.1',
			userAgent: 'Mozilla/5.0',
		};

		vi.spyOn(userRepository, 'validateCredentials').mockResolvedValueOnce(user as any);
		vi.spyOn(sessionRepository, 'save').mockResolvedValueOnce(undefined);

		const result = await loginUseCase.execute(request);

		expect(userRepository.validateCredentials).toHaveBeenCalledWith(request.emailOrUserName, request.password);
		expect(sessionRepository.save).toHaveBeenCalled();
		expect(result).toBeInstanceOf(LoginResponseDTO);
	});

	it('should successfully login with extended TTL when rememberMe is true', async () => {
		const user = {
			id: 'user-123',
			email: 'user@example.com',
			username: 'user123',
			fullName: 'User Example',
			roles: ['user'],
			isActive: true,
			emailVerified: true,
			canLogin: vi.fn().mockReturnValue(true),
			toPublic: vi.fn().mockReturnValue({
				id: 'user-123',
				email: 'user@example.com',
				username: 'user123',
				fullName: 'User Example',
				roles: ['user'],
				isActive: true,
				emailVerified: true,
			}),
		};

		const request: LoginRequestDTO = {
			emailOrUserName: 'user@example.com',
			password: 'password123',
			rememberMe: true,
			ipAddress: '192.168.1.1',
			userAgent: 'Mozilla/5.0',
		};

		vi.spyOn(userRepository, 'validateCredentials').mockResolvedValueOnce(user as any);
		vi.spyOn(sessionRepository, 'save').mockResolvedValueOnce(undefined);

		await loginUseCase.execute(request);

		expect(sessionRepository.save).toHaveBeenCalled();
	});

	it('should throw InvalidCredentialsError when credentials are invalid', async () => {
		const request: LoginRequestDTO = {
			emailOrUserName: 'user@example.com',
			password: 'wrongpassword',
			rememberMe: false,
			ipAddress: '192.168.1.1',
			userAgent: 'Mozilla/5.0',
		};

		vi.spyOn(userRepository, 'validateCredentials').mockResolvedValueOnce(null);

		await expect(loginUseCase.execute(request)).rejects.toThrow(InvalidCredentialsError);
		expect(logger.warn).toHaveBeenCalled();
	});

	it('should throw LoginError when user cannot login', async () => {
		const user = {
			id: 'user-123',
			email: 'user@example.com',
			username: 'user123',
			fullName: 'User Example',
			roles: ['user'],
			isActive: false,
			emailVerified: true,
			canLogin: vi.fn().mockReturnValue(false),
			toPublic: vi.fn().mockReturnValue({
				id: 'user-123',
				email: 'user@example.com',
				username: 'user123',
				fullName: 'User Example',
				roles: ['user'],
				isActive: false,
				emailVerified: true,
			}),
		};

		const request: LoginRequestDTO = {
			emailOrUserName: 'user@example.com',
			password: 'password123',
			rememberMe: false,
			ipAddress: '192.168.1.1',
			userAgent: 'Mozilla/5.0',
		};

		vi.spyOn(userRepository, 'validateCredentials').mockResolvedValueOnce(user as any);

		await expect(loginUseCase.execute(request)).rejects.toThrow(LoginError);
		expect(logger.warn).toHaveBeenCalledWith('Login failed - user inactive');
	});

	it('should create session with user agent and ip address', async () => {
		const user = {
			id: 'user-123',
			email: 'user@example.com',
			username: 'user123',
			fullName: 'User Example',
			roles: ['user'],
			isActive: true,
			emailVerified: true,
			canLogin: vi.fn().mockReturnValue(true),
			toPublic: vi.fn().mockReturnValue({
				id: 'user-123',
				email: 'user@example.com',
				username: 'user123',
				fullName: 'User Example',
				roles: ['user'],
				isActive: true,
				emailVerified: true,
			}),
		};

		const request: LoginRequestDTO = {
			emailOrUserName: 'user@example.com',
			password: 'password123',
			rememberMe: false,
			ipAddress: '192.168.1.1',
			userAgent: 'Mozilla/5.0',
		};

		vi.spyOn(userRepository, 'validateCredentials').mockResolvedValueOnce(user as any);
		vi.spyOn(sessionRepository, 'save').mockResolvedValueOnce(undefined);

		await loginUseCase.execute(request);

		expect(sessionRepository.save).toHaveBeenCalled();
		expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Login successful'), expect.any(Object));
	});

	it('should handle missing userAgent and ipAddress', async () => {
		const user = {
			id: 'user-123',
			email: 'user@example.com',
			username: 'user123',
			fullName: 'User Example',
			roles: ['user'],
			isActive: true,
			emailVerified: true,
			canLogin: vi.fn().mockReturnValue(true),
			toPublic: vi.fn().mockReturnValue({
				id: 'user-123',
				email: 'user@example.com',
				username: 'user123',
				fullName: 'User Example',
				roles: ['user'],
				isActive: true,
				emailVerified: true,
			}),
		};

		const request: LoginRequestDTO = {
			emailOrUserName: 'user@example.com',
			password: 'password123',
			rememberMe: false,
			ipAddress: undefined,
			userAgent: undefined,
		};

		vi.spyOn(userRepository, 'validateCredentials').mockResolvedValueOnce(user as any);
		vi.spyOn(sessionRepository, 'save').mockResolvedValueOnce(undefined);

		const result = await loginUseCase.execute(request);

		expect(result).toBeInstanceOf(LoginResponseDTO);
		expect(sessionRepository.save).toHaveBeenCalled();
	});
});
