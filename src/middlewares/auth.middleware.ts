import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';
import { ApplicationError } from '../errors';

export interface AuthorizedUser {
	userId: number;
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: AuthorizedUser;
	}
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.split(' ')[1]; // Expect: "Bearer <token>"

	if (!token) throw new ApplicationError('Token missing', StatusCodes.UNAUTHORIZED);

	try {
		const decoded = jwt.verify(token as string, config.jwt.secret) as JwtPayload;
		req.user = decoded as AuthorizedUser;
		next();
	} catch (err) {
		throw new ApplicationError('Invalid or expired token', StatusCodes.FORBIDDEN);
	}
};
