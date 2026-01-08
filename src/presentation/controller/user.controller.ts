import { NextFunction, Request, Response } from 'express';

import { Injectable } from '@shared';
import { RegisterUserRequestDTO } from '@application';
import type { IRegisterUserUseCase } from '@interfaces';

//TODO documentar
declare module '@ServiceMap' {
	interface ServiceMap {
		UserController: UserController;
	}
}

//TODO documentar
@Injectable({ name: 'UserController', depends: ['RegisterUserUseCase'] })
export class UserController {
	constructor(private readonly registerUseCase: IRegisterUserUseCase) {}

	public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const request = RegisterUserRequestDTO.fromBody(req.body);
			const response = this.registerUseCase.execute(request);
			res.status(201).json((await response).toJSON());
		} catch (error) {
			next(error);
		}
	};
}
