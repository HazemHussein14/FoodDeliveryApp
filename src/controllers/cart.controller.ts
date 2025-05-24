import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CartService } from '../services/cart.service';

declare module 'express-serve-static-core' {
	interface Request {
		user?: {
			userId: number;
		};
		validated?: any;
	}
}
export class CartController {
	private cartService = new CartService();

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
		sendResponse(res, StatusCodes.NO_CONTENT, 'Removed Item Successfully');
	}

	async clearCart(req: Request, res: Response) {
		const { cartId } = req.validated?.params;

		await this.cartService.clearCart(cartId);
		sendResponse(res, StatusCodes.NO_CONTENT, 'Cart Cleared Successfully');
	}
	async updateCartQuantities(req: Request, res: Response) {
		const { cartId, cartItemId } = req.validated?.params;
		const { quantity } = req.validated?.body;

		await this.cartService.updateCartQuantities(cartId, cartItemId, quantity);
		sendResponse(res, StatusCodes.OK, 'Updated Cart Quantities');
	}
	/**
	 * Add an item to the customer's cart.
	 * - Creates the cart if it doesn't exist.
	 * - Clears cart if switching restaurants.
	 * - Prevents duplicate items.
	 * - Returns updated cart with items.
	 */
	async addItemToCart(req: Request, res: Response) {
		try {
			const payload = req.validated?.body;
			const customerId = req.user?.userId || payload.customerId;

			const result = await this.cartService.addItemToCart({
				...payload,
				customerId
			});

			sendResponse(res, StatusCodes.CREATED, 'Item added to cart', result);
		} catch (error: any) {
			sendResponse(res, error.statusCode || StatusCodes.BAD_REQUEST, error.message, error?.data);
		}
	}

	/**
	 * (Optional alias)
	 * Simple alias for addItemToCart()
	 */
	async addItem(req: Request, res: Response) {
		return this.addItemToCart(req, res);
	}
}

