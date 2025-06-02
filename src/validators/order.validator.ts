import Joi from 'joi';
import { PlaceOrderDto, UpdateOrderStatusDto } from '../dto/order.dto';
import { idSchema } from './shared.validator';

export const placeOrderBodySchema = Joi.object<PlaceOrderDto>({
	userId: idSchema.label('User ID'),
	deliveryAddressId: idSchema.label('Delivery address ID'),
	paymentMethodId: idSchema.label('Payment method ID'),
	customerInstructions: Joi.string().allow('').max(1000).optional()
});

export const updateOrderStatusBodySchema = Joi.object<UpdateOrderStatusDto>({
	statusId: idSchema.label('Order status ID')
});

export const updateOrderStatusParamsSchema = Joi.object({
	orderId: idSchema.label('Order ID')
});

export const cancelOrderByCustomerBodySchema = Joi.object({
	userId: idSchema.label('User Id')
});

export const cancelOrderByCustomerParamsSchema = Joi.object({
	orderId: idSchema.label('Order Id')
});