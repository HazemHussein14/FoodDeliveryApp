// orders.schema.ts
const ordersSwaggerSchema = {
	Order: {
		type: 'object',
		properties: {
			orderId: { type: 'integer' },
			orderStatusId: { type: 'integer' },
			restaurantId: { type: 'integer' },
			cartId: { type: 'integer' },
			customerId: { type: 'integer' },
			deliveryAddressId: { type: 'integer' },
			customerInstructions: { type: 'string' },
			totalItems: { type: 'integer' },
			totalItemsAmount: { type: 'number', format: 'decimal' },
			deliveryFees: { type: 'number', format: 'decimal' },
			serviceFees: { type: 'number', format: 'decimal' },
			discount: { type: 'number', format: 'decimal' },
			totalAmount: { type: 'number', format: 'decimal' },
			placedAt: { type: 'string', format: 'date-time' },
			deliveredAt: { type: 'string', format: 'date-time' },
			cancellationInfo: {
				type: 'object',
				properties: {
					cancelledBy: { type: 'string', enum: ['customer', 'restaurant', 'system'] },
					cancellationReason: { type: 'string' },
					cancelledAt: { type: 'string', format: 'date-time' }
				}
			},
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' }
		}
	},
	OrderItem: {
		type: 'object',
		properties: {
			orderItemId: { type: 'integer' },
			orderId: { type: 'integer' },
			menuItemId: { type: 'integer' },
			quantity: { type: 'integer' },
			itemPrice: { type: 'number', format: 'decimal' },
			totalPrice: { type: 'number', format: 'decimal' },
			createdAt: { type: 'string', format: 'date-time' }
		}
	},
	CreateOrderRequest: {
		type: 'object',
		required: [
			'customerId',
			'restaurantId',
			'deliveryAddressId',
			'totalItemsQty',
			'totalItemsAmount',
			'serviceFees',
			'deliveryFees',
			'totalAmount',
			'placedAt',
			'items'
		],
		properties: {
			customerId: {
				type: 'integer',
				description: 'ID of the customer placing the order'
			},
			restaurantId: {
				type: 'integer',
				description: 'ID of the restaurant'
			},
			deliveryAddressId: {
				type: 'integer',
				description: 'ID of the delivery address'
			},
			customerInstructions: {
				type: 'string',
				description: 'Special instructions for the order'
			},
			totalItemsQty: {
				type: 'integer',
				description: 'Total number of items in the order'
			},
			totalItemsAmount: {
				type: 'number',
				format: 'decimal',
				description: 'Total amount of items before fees'
			},
			serviceFees: {
				type: 'number',
				format: 'decimal',
				description: 'Service fees for the order'
			},
			deliveryFees: {
				type: 'number',
				format: 'decimal',
				description: 'Delivery fees for the order'
			},
			totalAmount: {
				type: 'number',
				format: 'decimal',
				description: 'Total amount including all fees'
			},
			placedAt: {
				type: 'string',
				format: 'date-time',
				description: 'When the order was placed'
			},
			items: {
				type: 'array',
				items: {
					$ref: '#/components/schemas/OrderItem'
				},
				description: 'Items in the order'
			}
		}
	},
	UpdateOrderStatusRequest: {
		type: 'object',
		required: ['orderStatusId'],
		properties: {
			orderStatusId: {
				type: 'integer',
				description: 'ID of the new order status'
			}
		}
	},
	CancelOrderRequest: {
		type: 'object',
		required: ['cancellationReason', 'cancelledBy'],
		properties: {
			cancellationReason: {
				type: 'string',
				description: 'Reason for cancelling the order'
			},
			cancelledBy: {
				type: 'string',
				enum: ['customer', 'restaurant', 'system'],
				description: 'Who cancelled the order'
			}
		}
	},
	OrderQueryParams: {
		type: 'object',
		properties: {
			page: {
				type: 'integer',
				description: 'Page number for pagination',
				default: 1
			},
			limit: {
				type: 'integer',
				description: 'Number of items per page',
				default: 10
			},
			status: {
				type: 'string',
				enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
				description: 'Filter orders by status'
			},
			startDate: {
				type: 'string',
				format: 'date-time',
				description: 'Start date for filtering orders'
			},
			endDate: {
				type: 'string',
				format: 'date-time',
				description: 'End date for filtering orders'
			},
			sortBy: {
				type: 'string',
				enum: ['createdAt', 'totalAmount', 'placedAt'],
				description: 'Field to sort orders by'
			},
			sortOrder: {
				type: 'string',
				enum: ['ASC', 'DESC'],
				default: 'DESC',
				description: 'Sort order direction'
			}
		}
	}
};

export default ordersSwaggerSchema;
