import Joi from 'joi';

// Schema for login validation
export const authLoginBodySchema = Joi.object({
	email: Joi.string().email().required(), // Valid email is required
	password: Joi.string()
		.min(8) // Minimum 8 characters
		.max(30) // Maximum 30 characters
		.pattern(new RegExp('[a-z]')) // Must include at least one lowercase letter
		.pattern(new RegExp('[A-Z]')) // Must include at least one uppercase letter
		.pattern(new RegExp('[0-9]')) // Must include at least one digit
		.pattern(new RegExp('[^a-zA-Z0-9]')) // Must include at least one special character
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		})
}).required();

// Schema for customer registration
export const authCustomerRegisterBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(), // Name between 2–100 chars
	phone: Joi.string().min(10).max(15).required(), // Basic phone length validation
	birthDate: Joi.date().iso().required(), // ISO formatted date required
	gender: Joi.string().valid('male', 'female').required(), // Gender must be male or female
	email: Joi.string().email().required(), // Valid email is required
	password: Joi.string()
		.min(8)
		.max(30)
		.pattern(new RegExp('[a-z]'))
		.pattern(new RegExp('[A-Z]'))
		.pattern(new RegExp('[0-9]'))
		.pattern(new RegExp('[^a-zA-Z0-9]'))
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		})
}).required();

// Schema for requesting OTP
export const authRequestOtpBodySchema = Joi.object({
	phone: Joi.string().min(10).max(15).required() // Phone number required (basic length check)
}).required();

// Schema for verifying OTP
export const authVerifyOtpBodySchema = Joi.object({
	phone: Joi.string().min(10).max(15).required(), // Phone number required
	otp: Joi.string().length(6).required() // OTP must be exactly 6 digits
}).required();

// Schema for resetting password
export const authResetPasswordBodySchema = Joi.object({
	phone: Joi.string().min(10).max(15).required(), // Phone number required
	newPassword: Joi.string()
		.min(8)
		.max(30)
		.pattern(new RegExp('[a-z]'))
		.pattern(new RegExp('[A-Z]'))
		.pattern(new RegExp('[0-9]'))
		.pattern(new RegExp('[^a-zA-Z0-9]'))
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		}),
	resetToken: Joi.string().required() // Reset token must be provided
}).required();

// Schema for restaurant owner registration
export const authRestaurantOwnerRegisterBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(), // Name between 2–100 chars
	phone: Joi.string().min(10).max(15).required(), // Phone number required
	email: Joi.string().email().required(), // Valid email is required
	password: Joi.string()
		.min(8)
		.max(30)
		.pattern(new RegExp('[a-z]'))
		.pattern(new RegExp('[A-Z]'))
		.pattern(new RegExp('[0-9]'))
		.pattern(new RegExp('[^a-zA-Z0-9]'))
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		})
}).required();
