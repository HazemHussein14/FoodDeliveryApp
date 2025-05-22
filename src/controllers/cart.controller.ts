import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
	private cartService = new CartService();

	// TODO: Use validation middleware

	async addCart(req: Request, res: Response) {
		try {
			const cart = await this.cartService.createCart(req.body);
			sendResponse(res, StatusCodes.CREATED, 'Cart created successfully', cart);
		} catch (error: any) {
			// log the error
			// Preserve the error's status code in the controller
			// const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
			// sendResponse(res, statusCode, error.message || 'Failed to process request');
			sendResponse(res, StatusCodes.BAD_REQUEST, 'Failed to create cart', error.message);
		}
	}

	async viewCart(req: Request, res: Response) {
		try {
			// TODO: Use validation middleware to validate customerId
			// TODO: Use DTO for request and response, send the cart with its items
			// TODO: Use Logger
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

	async clearCart(req: Request, res: Response) {
		const { cartId } = req.validated?.params;

		await this.cartService.clearCart(cartId);
		sendResponse(res, StatusCodes.OK, 'Cart Cleared Successfully');
	}
	async updateCartQuantities(req: Request, res: Response) {
		const { cartId, cartItemId } = req.validated?.params;
		const { quantity } = req.validated?.body;

		await this.cartService.updateCartQuantities(cartId, cartItemId, quantity);
		sendResponse(res, StatusCodes.OK, 'Updated Cart Quantities');
	}
}
