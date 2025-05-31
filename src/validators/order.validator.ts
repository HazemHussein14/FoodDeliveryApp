import Joi from 'joi';
import { PlaceOrderDto } from '../dto/order.dto';

// Will be moved to shared validators
export const idSchema = Joi.number().integer().positive().required().messages({
	'number.base': '{{#label}} must be a valid number',
	'number.integer': '{{#label}} must be an integer',
	'number.positive': '{{#label}} must be positive',
	'any.required': '{{#label}} is required'
});

export const placeOrderBodySchema = Joi.object<PlaceOrderDto>({
	userId: idSchema.label('User ID'),
	deliveryAddressId: idSchema.label('Delivery address ID'),
	paymentMethodId: idSchema.label('Payment method ID'),
	customerInstructions: Joi.string().allow('').max(1000).optional()
});
