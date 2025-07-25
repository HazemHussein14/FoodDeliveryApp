import { NextFunction, Request, Response } from 'express';
import Joi, { ObjectSchema, ValidationOptions } from 'joi';
import { ApplicationError } from '../errors';
import { StatusCodes } from 'http-status-codes';

declare global {
	namespace Express {
		interface Request {
			validated?: {
				body?: any;
				query?: any;
				params?: any;
			};
		}
	}
}

interface RequestSchemas {
	body?: ObjectSchema;
	query?: ObjectSchema;
	params?: ObjectSchema;
}

const defaultOptions: ValidationOptions = {
	abortEarly: false,
	allowUnknown: false
};

export const validateRequest = (schemas: RequestSchemas) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const validationErrors: string[] = [];
		req.validated = {};

		if (schemas?.body) {
			const { value, error } = schemas.body.validate(req.body, defaultOptions);
			if (error) validationErrors.push(...error.details.map((d) => `Body: ${d.message}`));
			req.validated.body = value;
		}

		if (schemas?.query) {
			const { value, error } = schemas.query.validate(req.query, defaultOptions);
			if (error) validationErrors.push(...error.details.map((d) => `Query: ${d.message}`));
			req.validated.query = value;
		}

		if (schemas?.params) {
			const { value, error } = schemas.params.validate(req.params, defaultOptions);
			if (error) validationErrors.push(...error.details.map((d) => `Params: ${d.message}`));
			req.validated.params = value;
		}

		if (validationErrors.length) {
			return next(new ApplicationError('Validation error', StatusCodes.BAD_REQUEST, true, validationErrors));
		}

		next();
	};
};
