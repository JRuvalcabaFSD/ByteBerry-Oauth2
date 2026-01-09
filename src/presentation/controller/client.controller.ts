import { CreateClientRequestDTO } from '@application';
import type { ICreateClientUseCase, IListClientUseCase } from '@interfaces';
import { Injectable } from '@shared';
import { NextFunction, Request, Response } from 'express';

//TODO documentar
declare module '@ServiceMap' {
	interface ServiceMap {
		ClientController: ClientController;
	}
}

@Injectable({ name: 'ClientController', depends: ['CreateClientUseCase', 'ListClientUseCase'] })
export class ClientController {
	constructor(
		private readonly createUseCase: ICreateClientUseCase,
		private readonly listUseCase: IListClientUseCase
	) {}

	/**
	 * Creates a new OAuth2 client for the authenticated user.
	 *
	 * @param req - The Express request object containing the user context and client creation details in the body
	 * @param res - The Express response object used to send the created client data
	 * @param next - The Express next function for error handling
	 * @returns A promise that resolves when the response is sent
	 *
	 * @throws Passes errors to the next middleware for centralized error handling
	 *
	 * @example
	 * POST /clients
	 * Body: { name: "My App", redirectUris: ["https://example.com/callback"] }
	 * Response: 201 Created
	 */

	public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.user!.userId;
			const request = CreateClientRequestDTO.fromBody(req.body);
			const response = this.createUseCase.execute(userId, request);

			res.status(201).json((await response).toJSON());
		} catch (error) {
			next(error);
		}
	};

	/**
	 * Retrieves a list of clients for the authenticated user.
	 * @param req - The Express request object containing the authenticated user information
	 * @param res - The Express response object used to send the HTTP response
	 * @param next - The Express next function for error handling middleware
	 * @returns A promise that resolves to void
	 * @throws Passes errors to the next middleware via the next function
	 */

	public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.user!.userId;
			const response = await this.listUseCase.execute(userId);

			res.status(200).json(response.toJSON());
		} catch (error) {
			next(error);
		}
	};
}
