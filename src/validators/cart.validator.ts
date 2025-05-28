import Joi from 'joi';

export const idSchema = Joi.number().integer().positive().required().messages({
	'number.base': '{{#label}} must be a valid number',
	'number.integer': '{{#label}} must be an integer',
	'number.positive': '{{#label}} must be positive',
	'any.required': '{{#label}} is required'
});

export const createCartBodySchema = Joi.object({}).required();

export const removeItemParamsSchema = Joi.object({
	cartItemId: idSchema.label('Cart item ID')
}).required();

export const removeItemBodySchema = Joi.object({
	customerId: idSchema.label('Customer ID'),
	cartId: idSchema.label('Cart ID')
}).required();

export const clearCartSchema = Joi.object({
	cartId: idSchema.label('Cart ID')
});

export const updateCartQuantitiesParamsSchema = Joi.object({
	cartId: idSchema.label('Cart ID'),
	cartItemId: idSchema.label('Cart item ID')
});

export const updateCartQuantitiesBodySchema = Joi.object({
	quantity: idSchema.label('Quantity')
});

export const addCartItemSchema = Joi.object({
	customerId: idSchema.label('Customer ID'),
	itemId: idSchema.label('Item ID'),
	quantity: idSchema.label('Quantity')
}).required();
