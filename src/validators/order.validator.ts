import Joi from 'joi';
import { PlaceOrderDto } from '../dto/order.dto';
import { idSchema } from './shared.validator';

export const placeOrderBodySchema = Joi.object<PlaceOrderDto>({
	userId: idSchema.label('User ID'),
	deliveryAddressId: idSchema.label('Delivery address ID'),
	paymentMethodId: idSchema.label('Payment method ID'),
	customerInstructions: Joi.string().allow('').max(1000).optional()
});
