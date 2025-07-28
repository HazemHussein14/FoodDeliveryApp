import Joi from 'joi';

export const authLoginBodySchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string()
		.min(8) // minimum length
		.max(30) // maximum length (optional)
		.pattern(new RegExp('[a-z]')) // at least one lowercase
		.pattern(new RegExp('[A-Z]')) // at least one uppercase
		.pattern(new RegExp('[0-9]')) // at least one digit
		.pattern(new RegExp('[^a-zA-Z0-9]')) // at least one special character
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		})
	// role: Joi.string().valid('customer', 'restaurant_user')
}).required();

export const authCustomerRegisterBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	phone: Joi.string().min(10).max(15).required(), //TODO: enhance validation
	birthDate: Joi.date().iso().required(),
	gender: Joi.string().valid('male', 'female').required(),
	email: Joi.string().email().required(),
	password: Joi.string()
		.min(8) // minimum length
		.max(30) // maximum length (optional)
		.pattern(new RegExp('[a-z]')) // at least one lowercase
		.pattern(new RegExp('[A-Z]')) // at least one uppercase
		.pattern(new RegExp('[0-9]')) // at least one digit
		.pattern(new RegExp('[^a-zA-Z0-9]')) // at least one special character
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		})
	// role: Joi.string().valid('customer', 'restaurant_user')
}).required();

export const authRequestOtpBodySchema = Joi.object({
	phone: Joi.string().min(10).max(15).required() //TODO: enhance validation
}).required();

export const authVerifyOtpBodySchema = Joi.object({
	phone: Joi.string().min(10).max(15).required(), //TODO: enhance validation
	otp: Joi.string().length(6).required()
}).required();

export const authResetPasswordBodySchema = Joi.object({
	phone: Joi.string().min(10).max(15).required(), //TODO: enhance validation
	newPassword: Joi.string()
		.min(8) // minimum length
		.max(30) // maximum length (optional)
		.pattern(new RegExp('[a-z]')) // at least one lowercase
		.pattern(new RegExp('[A-Z]')) // at least one uppercase
		.pattern(new RegExp('[0-9]')) // at least one digit
		.pattern(new RegExp('[^a-zA-Z0-9]')) // at least one special character
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		}),
	resetToken: Joi.string().required()
}).required();

export const authRestaurantOwnerRegisterBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	phone: Joi.string().min(10).max(15).required(), //TODO: enhance validation
	email: Joi.string().email().required(),
	password: Joi.string()
		.min(8) // minimum length
		.max(30) // maximum length (optional)
		.pattern(new RegExp('[a-z]')) // at least one lowercase
		.pattern(new RegExp('[A-Z]')) // at least one uppercase
		.pattern(new RegExp('[0-9]')) // at least one digit
		.pattern(new RegExp('[^a-zA-Z0-9]')) // at least one special character
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		})
	// role: Joi.string().valid('customer', 'restaurant_user')
}).required();
