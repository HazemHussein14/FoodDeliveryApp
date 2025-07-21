import Joi from 'joi';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

export const loginSchema = Joi.object<LoginDto>({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	role: Joi.string().valid('customer', 'staff').required()
});

export const registerSchema = Joi.object<RegisterDto>({
	name: Joi.string().min(3).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	phone: Joi.string().optional(),
	userTypeId: Joi.number().required()
});
