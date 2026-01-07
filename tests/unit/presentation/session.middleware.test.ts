import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ILogger, ISessionRepository } from '@interfaces';
import { createSessionMiddleware, RedirectToLoginErrorHandle, UnAuthorizedErrorHandle } from '@presentation';

describe('createSessionMiddleware', () => {
	let mockRepository: ISessionRepository;
	let mockLogger: ILogger;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
		} as any;

		mockLogger = {
			debug: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as any;

		mockReq = {
			cookies: {},
			path: '/dashboard',
			method: 'GET',
		};

		mockRes = {
			redirect: vi.fn(),
			set: vi.fn(),
		} as any;
		mockNext = vi.fn();
	});

	it('should handle missing session cookie', async () => {
		const onError = new RedirectToLoginErrorHandle();
		const middleware = createSessionMiddleware(mockRepository, mockLogger, { onError });

		await middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.debug).toHaveBeenCalledWith('No session cookie found, redirecting to login', {
			path: '/dashboard',
			method: 'GET',
		});
		expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('/auth/login?return_url='));
	});

	it('should handle session not found', async () => {
		mockReq.cookies = { session_id: 'test-session-id-123' };
		vi.mocked(mockRepository.findById).mockResolvedValue(null);
		const onError = new RedirectToLoginErrorHandle();

		const middleware = createSessionMiddleware(mockRepository, mockLogger, { onError });

		await middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRepository.findById).toHaveBeenCalledWith('test-session-id-123');
		expect(mockLogger.warn).toHaveBeenCalledWith('Session not found, redirecting to login', {
			sessionId: 'test-ses...',
			path: '/dashboard',
		});
		expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('/auth/login?return_url='));
	});

	it('should handle expired session', async () => {
		mockReq.cookies = { session_id: 'test-session-id-123' };
		const mockSession = {
			userId: 'user-123',
			expiresAt: new Date(Date.now() - 1000),
			isExpired: vi.fn().mockReturnValue(true),
		};
		vi.mocked(mockRepository.findById).mockResolvedValue(mockSession as any);
		const onError = new UnAuthorizedErrorHandle();

		const middleware = createSessionMiddleware(mockRepository, mockLogger, { onError });

		await middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.warn).toHaveBeenCalledWith('Expired session detected, redirecting to login', expect.any(Object));
		expect(mockRes.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining('invalid_token'));
		expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
	});

	it('should attach user to request on valid session', async () => {
		mockReq.cookies = { session_id: 'test-session-id-123' };
		const mockSession = {
			userId: 'user-123',
			expiresAt: new Date(Date.now() + 3600000),
			isExpired: vi.fn().mockReturnValue(false),
		};
		vi.mocked(mockRepository.findById).mockResolvedValue(mockSession as any);
		const onError = new RedirectToLoginErrorHandle();

		const middleware = createSessionMiddleware(mockRepository, mockLogger, { onError });

		await middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.user).toEqual({ userId: 'user-123', sessionId: 'test-ses...' });
		expect(mockLogger.debug).toHaveBeenCalledWith('Session validate successfully', expect.any(Object));
		expect(mockNext).toHaveBeenCalled();
	});

	it('should handle unexpected errors', async () => {
		mockReq.cookies = { session_id: 'test-session-id-123' };
		const error = new Error('Database error');
		vi.mocked(mockRepository.findById).mockRejectedValue(error);
		const onError = new RedirectToLoginErrorHandle();

		const middleware = createSessionMiddleware(mockRepository, mockLogger, { onError });

		await middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith('Unexpected error in session middleware', { error });
		expect(mockNext).toHaveBeenCalledWith(error);
	});
});
