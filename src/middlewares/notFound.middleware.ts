import { NextFunction, Request, Response } from 'express';
import { ApplicationError, ErrMessages } from '../errors';
import { StatusCodes } from 'http-status-codes';

export function NotFoundHandler(req: Request, res: Response, _next: NextFunction) {
	const message = `${req.method} ${req.path}`;
	throw new ApplicationError(ErrMessages.http.NotFound, StatusCodes.NOT_FOUND);
}
