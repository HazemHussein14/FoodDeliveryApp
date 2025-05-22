import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem } from '../models';
import logger from '../config/logger';
import { CartRepository } from '../repositories/cart.repository';

export class CartService {
	private cartRepo = new CartRepository();

	// TODO: Use DTO instead of any - Implement DTOs for request/response data:
	// Add validation
	async createCart(data: any) {
		const cart = await this.cartRepo.createCart(data);
		return cart;
	}

	// TODO: Add to cart method

	// Standardize on ApplicationError throughout the service:

	async viewCart(customerId: number) {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		// Replace this
		if (!cart) throw new Error('Cart not found');
		// With this
		// if (!cart) throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		return cart;
	}

	// TODO: use decorators for Transactions
	async removeItem(cartItemId: number) {
		logger.info(`Starting removal of cart item`, { cartItemId });

		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			logger.info(`Beginning transaction for cart item removal`, { cartItemId });

			const cartItem = await transactionalEntityManager.findOne(CartItem, {
				where: { cartItemId },
				relations: ['cart']
			});

			if (!cartItem) {
				throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);
			}

			const cart = cartItem.cart;
			if (!cart) {
				throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
			}

			// TODO: validate that the customer owns the cart

			logger.info(`Deleting cart item`, { cartItemId });
			await transactionalEntityManager.delete(CartItem, cartItemId);

			logger.info(`Successfully removed cart item and updated cart totals`, {
				cartItemId,
				cartId: cart.cartId
			});
		});
	}

	async clearCart(cartId: number) {
		logger.info('clearing cart items', { cartId });

		await AppDataSource.transaction(async (transactionalEntityManager) => {
			const cart = await transactionalEntityManager.findOne(Cart, {
				where: { cartId },
				relations: ['items']
			});

			if (!cart) {
				throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
			}

			await transactionalEntityManager.remove(cart.cartItems);
		});
	}

	// TODO: use decorators for Transactions
	async updateCartQuantities(cartId: number, cartItemId: number, quantity: number) {
		logger.info('updating item qunatity', { cartId, cartItemId, quantity });

		await AppDataSource.transaction(async (transactionalEntityManager) => {
			// TODO: you can get the item by cartId and cartItemId instead of getting the whole cart
			const cart = await transactionalEntityManager.findOne(Cart, {
				where: { cartId },
				relations: ['items']
			});

			if (!cart) {
				throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
			}

			const item = cart.cartItems.find((item) => item.cartItemId === cartItemId);
			if (!item) throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);

			// Cart totalItems isn't updated after changing quantity
			await transactionalEntityManager.update(CartItem, cartItemId, { quantity });
		});
	}
}
