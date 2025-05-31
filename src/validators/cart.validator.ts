import Joi from 'joi';
import { idSchema } from './shared.validator';

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
