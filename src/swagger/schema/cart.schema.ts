// cart.schema.ts
const cartSwaggerSchema = {
	Cart: {
		type: 'object',
		properties: {
			cartId: { type: 'integer' },
			customerId: { type: 'integer' },
			restaurantId: { type: 'integer' },
			totalItems: { type: 'integer' },
			isActive: { type: 'boolean' },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' }
		}
	},
	CartItem: {
		type: 'object',
		properties: {
			cartItemId: { type: 'integer' },
			cartId: { type: 'integer' },
			menuItemId: { type: 'integer' },
			quantity: { type: 'integer' },
			price: { type: 'number', format: 'decimal' },
			discount: { type: 'number', format: 'decimal' },
			totalPrice: { type: 'number', format: 'decimal' },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' }
		}
	},
	RemoveCartItemParams: {
		type: 'object',
		required: ['cartItemId'],
		properties: {
			cartItemId: {
				type: 'integer',
				description: 'ID of the cart item to remove'
			}
		}
	},
	RemoveCartItemBody: {
		type: 'object',
		required: ['customerId', 'cartId'],
		properties: {
			customerId: {
				type: 'integer',
				description: 'ID of the customer'
			},
			cartId: {
				type: 'integer',
				description: 'ID of the cart'
			}
		}
	}
};

export default cartSwaggerSchema;
