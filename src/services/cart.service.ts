import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem } from '../models';
import logger from '../config/logger';
import { CartRepository, CustomerRepository } from '../repositories';
import { Transactional } from 'typeorm-transactional';
import { RemoveCartItemDto } from '../dto/cart-item.dto';

export class CartService {
	private cartRepo = new CartRepository();
	private customerRepo = new CustomerRepository();

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
	@Transactional()
	async removeItem(removeCartItemDto: RemoveCartItemDto) {
		logger.info(`Starting removal of cart item ${removeCartItemDto.cartItemId}`);

		// TODO: validate that the customer owns the cart
		const customer = await this.customerRepo.getCustomerById(removeCartItemDto.customerId);

		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const cart = await this.cartRepo.getCartById(removeCartItemDto.cartId);
		if (!cart) {
			throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		}

		if (cart.customerId !== removeCartItemDto.cartId) {
			throw new ApplicationError(ErrMessages.http.Unauthorized, StatusCodes.FORBIDDEN);
		}

		const cartItem = await this.cartRepo.getCartItem(removeCartItemDto.cartItemId);

		if (!cartItem) {
			throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);
		}

		if (cartItem.cartId !== cart.cartId) {
			throw new ApplicationError(ErrMessages.cart.CartItemAlreadyExists, StatusCodes.BAD_REQUEST);
		}

		logger.info(`Deleting cart item ${removeCartItemDto.cartItemId}`);
		await this.cartRepo.deleteCartItem(removeCartItemDto.cartItemId);

		logger.info(`Successfully removed cart item ${removeCartItemDto.cartItemId} from cart ${removeCartItemDto.cartId}`);
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
