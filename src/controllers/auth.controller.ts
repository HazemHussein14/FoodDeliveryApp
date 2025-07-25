import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

export class AuthController {
	private service = new AuthService();

	async login(req: Request, res: Response) {
		const result = await this.service.login(req.body);
		sendResponse(res, StatusCodes.OK, 'Login successful', result);
	}

	async register(req: Request, res: Response) {
		const result = await this.service.register(req.body);
		sendResponse(res, StatusCodes.CREATED, 'Registration successful', result);
	}
}
