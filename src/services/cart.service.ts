import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem } from '../models';
import logger from '../config/logger';

export class CartService {
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

			if (!cart.isActive) {
				throw new ApplicationError(ErrMessages.cart.CartNotActive, StatusCodes.BAD_REQUEST);
			}

			logger.info(`Deleting cart item`, { cartItemId });
			await transactionalEntityManager.delete(CartItem, cartItemId);

			const cartItems = await transactionalEntityManager.find(CartItem, {
				where: { cartId: cart.cartId }
			});

			const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

			await transactionalEntityManager.update(Cart, cart.cartId, { totalItems });

			logger.info(`Successfully removed cart item and updated cart totals`, {
				cartItemId,
				cartId: cart.cartId,
				newTotalItems: totalItems
			});
		});
	}
}
