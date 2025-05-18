import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
	private cartService = new CartService();

	async viewCart(req: Request, res: Response) {
		try {
			const customerId = parseInt(req.params.customerId);
			const cart = await this.cartService.viewCart(customerId);
			sendResponse(res, HttpStatusCodes.OK, 'Cart fetched successfully', cart);
		} catch (error: any) {
			sendResponse(res, HttpStatusCodes.NOT_FOUND, 'Cart not found', error.message);
		}
	}

	async updateCart(req: Request, res: Response) {
		try {
			const cartId = parseInt(req.params.cartId);
			const data = req.body;
			const cart = await this.cartService.updateCart(cartId, data);
			sendResponse(res, HttpStatusCodes.OK, 'Cart updated successfully', cart);
		} catch (error: any) {
			sendResponse(res, HttpStatusCodes.NOT_FOUND, 'Failed to update cart', error.message);
		}
	}
}
