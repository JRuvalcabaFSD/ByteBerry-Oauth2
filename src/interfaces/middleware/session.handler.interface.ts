import { NextFunction, Request, Response } from 'express';

/**
 * Interface for handling session-related errors in middleware.
 *
 * @remarks
 * Implement this interface to define custom logic for handling different session error scenarios
 * such as missing cookies, session not found, or expired sessions.
 *
 * @method handle
 * Handles the session error based on the provided option.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the Express stack.
 * @param option - The type of session error to handle. Can be:
 *   - 'no-cookie': Indicates that the session cookie is missing.
 *   - 'not-found': Indicates that the session was not found.
 *   - 'expired': Indicates that the session has expired.
 */

export interface ISessionErrorHandle {
	handle(req: Request, res: Response, next: NextFunction, option: 'no-cookie' | 'not-found' | 'expired'): void;
}
