import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
	private cartService = new CartService();

	async addCart(req: Request, res: Response) {
		try {
			const cart = await this.cartService.createCart(req.body);
			sendResponse(res, StatusCodes.CREATED, 'Cart created successfully', cart);
		} catch (error: any) {
			sendResponse(res, StatusCodes.BAD_REQUEST, 'Failed to create cart', error.message);
		}
	}

	async viewCart(req: Request, res: Response) {
		try {
			const customerId = parseInt(req.params.customerId);
			const cart = await this.cartService.viewCart(customerId);
			sendResponse(res, StatusCodes.OK, 'Cart fetched successfully', cart);
		} catch (error: any) {
			sendResponse(res, StatusCodes.NOT_FOUND, 'Cart not found', error.message);
		}
	}

	async removeItem(req: Request, res: Response) {
		const { cartItemId } = req.validated?.params;

		await this.cartService.removeItem(cartItemId);
		sendResponse(res, StatusCodes.OK, 'Removed Item Successfully');
	}
}
