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
		CartItemAlreadyExists: 'Cart Item Already Exists',
		CartNotActive: 'Cart Is Not Active'
	},

  customer: {
    CustomerNotFound: "Customer Not Found"
  }
};
