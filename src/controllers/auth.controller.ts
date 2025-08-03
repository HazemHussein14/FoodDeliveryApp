import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { RegisterCustomerDto, RegisterDto } from '../dto/auth.dto';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';

@injectable()
export class AuthController {
	constructor(
		@inject(TYPES.AuthService) private readonly authService: AuthService
	) {}

	// Handle user login
	async login(req: Request, res: Response) {
		const { email, password } = req.validated?.body;
		const tokens = await this.authService.login({ email, password });
		sendResponse(res, StatusCodes.OK, 'Login successfully', tokens);
	}

	// Handle customer registration
	async registerCustomer(req: Request, res: Response) {
		const payload: RegisterCustomerDto = req.validated?.body;
		const customer = await this.authService.registerCustomer(payload);
		sendResponse(res, StatusCodes.CREATED, 'Customer registered successfully', customer);
	}

	// Handle restaurant owner registration
	async registerRestaurantOwner(req: Request, res: Response) {
		const payload: RegisterDto = req.validated?.body;
		const restaurantOwner = await this.authService.registerRestaurantOwner(payload);
		sendResponse(res, StatusCodes.CREATED, 'Registration successful. Awaiting admin approval.', restaurantOwner);
	}

	// Request OTP via phone number
	async requestOtp(req: Request, res: Response) {
		const { phone } = req.validated?.body;
		await this.authService.requestOtp(phone);
		sendResponse(res, StatusCodes.OK, 'OTP sent successfully');
	}

	// Verify the OTP sent to user's phone
	async verifyOtp(req: Request, res: Response) {
		const { phone, otp } = req.validated?.body;
		const result = await this.authService.verifyOtp(phone, otp);
		sendResponse(res, StatusCodes.OK, 'OTP verified successfully', result);
	}

	// Reset user password using reset token
	async resetPassword(req: Request, res: Response) {
		const { phone, newPassword, resetToken } = req.validated?.body;
		await this.authService.resetPassword(phone, newPassword, resetToken);
		sendResponse(res, StatusCodes.OK, 'Password reset successfully');
	}
}
