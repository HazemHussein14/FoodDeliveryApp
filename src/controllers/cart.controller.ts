import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
	private cartService = new CartService();

	async removeItem(req: Request, res: Response) {
		const { cartItemId } = req.validated?.params;

		await this.cartService.removeItem(cartItemId);
		sendResponse(res, StatusCodes.OK, 'Removed Item Successfully');
	}
}
