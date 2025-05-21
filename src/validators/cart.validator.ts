import Joi from 'joi';

export const createCartBodySchema = Joi.object({}).required();

export const removeItemSchema = Joi.object({
	cartItemId: Joi.number().integer().positive().required().messages({
		'number.base': 'Cart item ID must be a valid number',
		'number.integer': 'Cart item ID must be an integer',
		'number.positive': 'Cart item ID must be positive',
		'any.required': 'Cart item ID is required'
	})
}).required();

export const clearCartSchema = Joi.object({
	cartId: Joi.number().integer().positive().required()
});

export const updateCartQuantitiesParamsSchema = Joi.object({
	cartId: Joi.number().integer().positive().required(),
	cartItemId: Joi.number().integer().positive().required()
});

export const updateCartQuantitiesBodySchema = Joi.object({
	quantity: Joi.number().integer().positive().required()
});
