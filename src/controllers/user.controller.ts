import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/user.dto';

export class UserController {
	private userService = new UserService();

	async create(req: Request, res: Response) {
		const dto = req.validated?.body as CreateUserDto;
		const user = await this.userService.createUser(dto);
		sendResponse(res, HttpStatusCodes.OK, 'User created successfully', user);
	}

	async getAll(req: Request, res: Response) {
		const { limit, page } = req.validated?.query;
		const users = await this.userService.getActiveUsers(limit);
		sendResponse(res, HttpStatusCodes.OK, 'List users', users);
	}

	async getOne(req: Request, res: Response) {
		const { id } = req.validated?.params;
		const users = await this.userService.getOne(Number(id));
		sendResponse(res, HttpStatusCodes.OK, 'Get User', users);
	}

	async test(req: Request, res: Response) {
		sendResponse(res, HttpStatusCodes.OK, 'Sending without validation');
	}
}
