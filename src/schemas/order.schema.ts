import Joi from 'joi';

// Schema for order items
export const orderItemSchema = Joi.object({
    menuItemId: Joi.number().required().min(1),
    quantity: Joi.number().required().min(1),
    itemPrice: Joi.number().required().min(0),
    totalPrice: Joi.number().required().min(0)
});

// Schema for creating a new order
export const createOrderSchema = Joi.object({
    customerId: Joi.number().required().min(1),
    restaurantId: Joi.number().required().min(1),
    deliveryAddressId: Joi.number().required().min(1),
    customerInstructions: Joi.string().allow('').max(500),
    totalItemsQty: Joi.number().required().min(1),
    totalItemsAmount: Joi.number().required().min(0),
    serviceFees: Joi.number().required().min(0),
    deliveryFees: Joi.number().required().min(0),
    totalAmount: Joi.number().required().min(0),
    placedAt: Joi.date().iso().required(),
    items: Joi.array().items(orderItemSchema).required().min(1)
});

// Schema for updating order status
export const updateOrderStatusSchema = Joi.object({
    orderStatusId: Joi.number().required().min(1)
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

// Schema for order ID parameter
export const orderIdSchema = Joi.object({
    orderId: Joi.number().required().min(1)
}); 