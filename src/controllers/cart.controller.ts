import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
	private cartService = new CartService();

	async createCart(req: Request, res: Response) {
		try {
			const cart = await this.cartService.createCart(req.body);
			sendResponse(res, HttpStatusCodes.CREATED, 'Cart created successfully', cart);
		} catch (error: any) {
			sendResponse(res, HttpStatusCodes.BAD_REQUEST, 'Failed to create cart', error.message);
		}
	}

	async viewCart(req: Request, res: Response) {
		try {
			const customerId = parseInt(req.params.customerId);
			const cart = await this.cartService.viewCart(customerId);
			sendResponse(res, HttpStatusCodes.OK, 'Cart fetched successfully', cart);
		} catch (error: any) {
			sendResponse(res, HttpStatusCodes.NOT_FOUND, 'Cart not found', error.message);
		}
	}

}
