export const ErrMessages = {
	// Common Errors
	http: {
		BadRequest: 'Bad Request',
		Unauthorized: 'Unauthorized',
		Forbidden: 'Forbidden',
		NotFound: 'Not Found',
		InternalServerError: 'Internal Server Error'
	},
	validation: {
		// Validation Errors
		ValidationError: 'Validation Error',
		InvalidInput: 'Invalid Input'
	},

	auth: {
		// Authentication Errors
		InvalidCredentials: 'Invalid Credentials',
		TokenExpired: 'Token Expired',
		TokenInvalid: 'Token Invalid',
		AccessDenied: 'Access Denied'
	},

	database: {
		// Database Errors
		DatabaseConnectionError: 'Database Connection Error',
		RecordNotFound: 'Record Not Found'
	},

	file: {
		// File Upload Errors
		FileTooLarge: 'File Too Large',
		UnsupportedFileType: 'Unsupported File Type'
	},

	misc: {
		// Miscellaneous Errors
		UnknownError: 'Unknown Error'
	},

	rateLimit: {
		// Rate Limiting Errors
		TooManyRequests: 'Too Many Requests'
	},
	cors: {
		// CORS Errors
		CorsError: 'CORS Error'
	},

	// Custom Errors
	// todo: add custom errors here
		cart: {
		CartNotFound: 'Cart Not Found',
		CartAlreadyExists: 'Cart Already Exists',
		CartItemNotFound: 'Cart Item Not Found',
		CartItemAlreadyExistOnCart: 'Item already exist on cart',
		CartItemDoesNotBelongToCart: 'Cart Item Does Not Belong To The Specified Cart',
		CartItemsDoesNotBelongToSameRestaurant: 'Cart Items Does Not Belong To Same Restaurant',
		FailedToUpdateCartItem: 'Failed to update cart item',
		FailedToUpdateCart: 'Failed to update cart',
		CartIsEmpty: 'Cart is empty',
		CartIsNotActive: 'Cart is not active',
		FailedToClearCart: 'Failed to clear cart',
		FailedToDeleteCartItem: 'Failed to delete cart item'
	},

	restaurant: {
		RestaurantNotFound: 'Restaurant not found',
		RestaurantNotAvailable:
			'Sorry restaurant cannot process your order right now, try again later or choose different one',
		RestaurantNotOpen: 'Restaurant is not open'
	},

	item: {
		ItemNotFound: 'Item Not Found',
		ItemPriceNotFound: 'Item price not found',
		ItemNotAvailable: 'Item is not available'
	},

	menu: {
		NoActiveMenuFound: 'Sorry there is no active menu for current restaurant',
		ItemNotBelongToActiveMenu: 'Item does not belong to an active menu of this restaurant'
	},
	customer: {
		CustomerNotFound: 'Customer not found'
	},

	order: {
		OrderNotFound: 'Order not found',
		OrderStatusNotFound: 'Order status not found',
		OrderItemNotFound: 'Order item not found',
		CancellationUnAlllowed: 'Order cant be cancelled'
	}
};
