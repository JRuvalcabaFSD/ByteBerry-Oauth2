import { RequestHandler, Router } from 'express';

import { AuthController, LoginController } from '@presentation';

//TODO documentar
export function createAuthRoutes(loginCtl: LoginController, authCtl: AuthController, requireSession: RequestHandler): Router {
	const router = Router();

	router.get('/login', loginCtl.getLoginForm);
	router.post('/login', loginCtl.login);
	router.get('/authorize', requireSession, authCtl.handle);
	return router;
}
