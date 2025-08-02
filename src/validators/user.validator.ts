import Joi from 'joi';

export const createUserBodySchema = Joi.object({
	name: Joi.string().required().min(3).max(30),
	phone: Joi.string()
		.required()
		.pattern(/^\+?[1-9]\d{1,14}$/), // E.164 format
	password: Joi.string()
		.required()
		.min(8)
		.max(100)
		.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/), // At least one uppercase, one lowercase, one digit, one special character
	email: Joi.string().required().email(),
	userTypeId: Joi.number().min(1).required()
}).required();

export const getUsersQuerySchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(10)
}).required();

export const getUserParamsSchema = Joi.object({
	id: Joi.number().min(1).required()
}).required();
