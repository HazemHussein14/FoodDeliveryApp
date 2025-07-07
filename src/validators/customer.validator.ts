import Joi from 'joi';
import { idSchema } from './shared.validator';
import { AddOrderRatingDto, AddAddressDto, UpdateAddressDto } from '../dto/customer.dto';

export const deactivateCustomerSchema = Joi.object({
	customerId: idSchema.label('customer ID')
}).required();

export const viewCustomerOrderStatus = Joi.object({
	customerId: idSchema.label('customer ID'),
	orderId: idSchema.label('order ID')
}).required();

export const submitCustomerFeedbackValidations = {
	parms: Joi.object({
		customerId: idSchema.label('customer ID'),
		orderId: idSchema.label('order ID')
	}).required(),
	body: Joi.object<AddOrderRatingDto>({
		rating: Joi.number().integer().min(1).max(5).label('Rating'),

		comment: Joi.string().trim().min(1).label('Comment')
	})
		.or('rating', 'comment')
		.required()
};

export const viewCustomerOrderHistory = Joi.object({
	customerId: idSchema.label('customer ID')
}).required();

export const addAddressSchema = {
	params: Joi.object({
		customerId: idSchema.label('customer ID')
	}).required(),
	body: Joi.object<AddAddressDto>({
		addressLine1: Joi.string().required(),
		addressLine2: Joi.string().required(),
		city: Joi.string().required(),
		isDefault: Joi.boolean().required()
	}).required()
};

export const updateAddressSchema = {
	params: Joi.object({
		customerId: idSchema.label('customer ID'),
		addressId: idSchema.label('address ID')
	}).required(),
	body: Joi.object<UpdateAddressDto>({
		addressLine1: Joi.string(),
		addressLine2: Joi.string(),
		city: Joi.string(),
		isDefault: Joi.boolean()
	}).required()
};

export const deleteAddressSchema = Joi.object({
	customerId: idSchema.label('customer ID'),
	addressId: idSchema.label('address ID')
}).required();

export const getAddressSchema = Joi.object({
	customerId: idSchema.label('customer ID'),
	addressId: idSchema.label('address ID')
}).required();

export const getAllAddressesSchema = Joi.object({
	customerId: idSchema.label('customer ID')
}).required();

export const setDefaultAddressSchema = Joi.object({
	customerId: idSchema.label('customer ID'),
	addressId: idSchema.label('address ID')
}).required();

export const setPreferredPaymentMethodSchema = {
	params: Joi.object({
		customerId: idSchema.label('customer ID')
	}).required(),
	body: Joi.object({
		paymentMethodId: idSchema.label('payment method ID')
	}).required()
};
