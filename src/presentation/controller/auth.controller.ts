import { NextFunction, Request, Response } from 'express';

import { Injectable, InvalidCodeError } from '@shared';
import { CodeRequestDTO } from '@application';
import type { IGenerateAuthCodeUseCase } from '@interfaces';

/**
 * Extends the global ServiceMap interface to include the IConfig interface.
 * This allows for type-safe access to configuration settings throughout the application.
 * @module @ServiceMap
 * @interface ServiceMap
 */

declare module '@ServiceMap' {
	interface ServiceMap {
		AuthController: AuthController;
	}
}

//TODO documentar
@Injectable({ name: 'AuthController', depends: ['GenerateCodeUseCase'] })
export class AuthController {
	constructor(private readonly useCase: IGenerateAuthCodeUseCase) {}

	public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const request = CodeRequestDTO.fromQuery(req.query as Record<string, string>);
			const userId = req.user?.userId;

			if (!userId) throw new InvalidCodeError('Authentication required');

			const response = this.useCase.execute(userId, request);
			const redirectUri = (await response).buildRedirectURrl(request.redirectUri);

			res.redirect(redirectUri);
		} catch (error) {
			next(error);
		}
	};
}
