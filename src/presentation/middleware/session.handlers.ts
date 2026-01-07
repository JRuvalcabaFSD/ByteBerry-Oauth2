import { ISessionErrorHandle } from '@interfaces';
import { InvalidSessionError } from '@shared';
import { Request, Response, NextFunction } from 'express';

/**
 * Handles session-related errors by redirecting the user to the login page.
 *
 * This implementation of `ISessionErrorHandle` intercepts requests with session errors
 * (such as missing, not found, or expired session cookies) and redirects the user to
 * the `/auth/login` route. The original requested URL is preserved and passed as the
 * `return_url` query parameter, allowing the user to be redirected back after successful login.
 *
 * @implements {ISessionErrorHandle}
 */

export class RedirectToLoginErrorHandle implements ISessionErrorHandle {
	handle(req: Request, res: Response, _next: NextFunction, _reason: 'no-cookie' | 'not-found' | 'expired'): void {
		const returnUrl = encodeURIComponent(req.originalUrl);
		res.redirect(`/auth/login?return_url=${returnUrl}`);
	}
}

/**
 * Handles unauthorized session errors by implementing the `ISessionErrorHandle` interface.
 *
 * This class inspects the reason for the session error (such as missing, not found, or expired session)
 * and sets the appropriate HTTP response headers. It then forwards an `InvalidSessionError` to the next
 * middleware in the Express.js pipeline with a descriptive message.
 *
 * @implements {ISessionErrorHandle}
 */

export class UnAuthorizedErrorHandle implements ISessionErrorHandle {
	handle(req: Request, res: Response, next: NextFunction, reason: 'no-cookie' | 'not-found' | 'expired'): void {
		let msg: string;
		switch (reason) {
			case 'expired':
				msg = 'The session has expired';
				break;
			case 'no-cookie':
			case 'not-found':
				msg = 'Invalid or missing session';
				break;
		}

		res.set('WWW-Authenticate', 'Bearer error="invalid_token", error_description="Session invalid or expired"');
		next(new InvalidSessionError(msg));
	}
}
