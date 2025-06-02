import Joi from 'joi';
import { PlaceOrderDto, UpdateOrderStatusDto } from '../dto/order.dto';
import { idSchema } from './shared.validator';

export const orderIdSchema = Joi.object({
	orderId: idSchema.label('Order ID')
});

export const placeOrderBodySchema = Joi.object<PlaceOrderDto>({
	userId: idSchema.label('User ID'),
	deliveryAddressId: idSchema.label('Delivery address ID'),
	paymentMethodId: idSchema.label('Payment method ID'),
	customerInstructions: Joi.string().allow('').max(1000).optional()
});

// Schema for order cancellation
export const cancelOrderSchema = Joi.object({
	cancellationReason: Joi.string().required().min(3).max(500),
	cancelledBy: Joi.string().valid('customer', 'restaurant', 'system').required()
});

// Schema for order query parameters
export const orderQuerySchema = Joi.object({
	page: Joi.number().min(1).default(1),
	limit: Joi.number().min(1).max(100).default(10),
	status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'),
	startDate: Joi.date().iso(),
	endDate: Joi.date().iso().min(Joi.ref('startDate')),
	sortBy: Joi.string().valid('createdAt', 'totalAmount', 'placedAt'),
	sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
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

export const getOrderDetailsParamsSchema = Joi.object({
	orderId: Joi.number().integer().min(1).required()
}).required();
