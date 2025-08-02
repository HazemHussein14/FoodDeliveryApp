import { validateRequest } from './../middlewares/validate-request.middleware';
import { Router } from 'express';
const AuthRouter = Router();
import { AuthController } from '../controllers/auth.controller';
import {
	authCustomerRegisterBodySchema,
	authLoginBodySchema,
	authRequestOtpBodySchema,
	authVerifyOtpBodySchema,
	authResetPasswordBodySchema,
	authRestaurantOwnerRegisterBodySchema
} from '../validators/auth.validator';
import { customRateLimiter } from '../config/ratelimiter';

// Instantiate the authentication controller
const controller = new AuthController();

// Login route with validation
AuthRouter.post('/login', validateRequest({ body: authLoginBodySchema }), controller.login.bind(controller));

// Customer registration route with validation
AuthRouter.post(
	'/register',
	validateRequest({ body: authCustomerRegisterBodySchema }),
	controller.registerCustomer.bind(controller)
);

// OTP request route with rate limiting and validation
AuthRouter.post(
	'/request-otp',
	customRateLimiter(1, 180000), // Allow 1 request every 3 minutes per IP
	validateRequest({ body: authRequestOtpBodySchema }),
	controller.requestOtp.bind(controller)
);

// OTP verification route with validation
AuthRouter.post(
	'/verify-otp',
	validateRequest({ body: authVerifyOtpBodySchema }),
	controller.verifyOtp.bind(controller)
);

// Password reset route with validation
AuthRouter.post(
	'/reset-password',
	validateRequest({ body: authResetPasswordBodySchema }),
	controller.resetPassword.bind(controller)
);

// Restaurant owner registration route with validation
AuthRouter.post(
	'/register-restaurant-owner',
	validateRequest({ body: authRestaurantOwnerRegisterBodySchema }),
	controller.registerRestaurantOwner.bind(controller)
);

export default AuthRouter;
