import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem, MenuItem } from '../models';
import logger from '../config/logger';
import { CartRepository, MenuRepository } from '../repositories';
import { CartAddItemDto, CartItemResponse, CartResponse } from '../dto/cart.dto';

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();
	private dataSource = AppDataSource;

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

 /**
   * Add a new item to customer's cart
   * - Creates a new cart if it doesn't exist
   * - Validates item belongs to restaurant's active menu
   * - Clears cart if switching restaurants
   * - Prevents duplicate items
   * - Returns full cart with items
   */
  async addItemToCart(payload: CartAddItemDto): Promise<CartResponse> {
    const { customerId, restaurantId, itemId, quantity } = payload;

    // 1. Check if item exists
    const item = await this.getItemByIdOrFail(itemId);

    // 2. Get or create cart
    let cart = await this.getCart(customerId);
    const isNewCart = !cart;
    if (isNewCart) cart = await this.createCart(customerId);

    // 3. Get current restaurant of the cart (via cart items)
    const cartRestaurantId = isNewCart
      ? restaurantId
      : ((await this.getCurrentRestaurantOfCart(cart!.cartId)) ?? restaurantId);

    // 4. Validate item belongs to restaurant's active menu
    await this.validateItemBelongsToRestaurant(restaurantId, itemId);

    // 5. If restaurant is different, clear cart
    if (!isNewCart && cartRestaurantId !== restaurantId) {
      await this.clearCart(cart!.cartId);
    }

    // 6. Prevent duplicate item in cart
    const itemAlreadyInCart = await this.isItemExistOnCart(cart!.cartId, itemId);
    if (itemAlreadyInCart) {
      throw new ApplicationError(ErrMessages.cart.CartAlreadyExists, StatusCodes.BAD_REQUEST);
    }

    // 7. Create and save cart item
    const cartItem = CartItem.buildCartItem({
      cartId: cart!.cartId,
      itemId,
      restaurantId,
      price: item.price,
      quantity
    });
    await this.cartRepo.addCartItem(cartItem);

    // 8. Return full cart with items
    const cartItems = await this.cartRepo.getCartItems(cart!.cartId);
    const items = cartItems.map((item) => this.cartItemReturn(item));
    return this.cartResponse(cart!, items);
  }

  // Create new cart
  private async createCart(customerId: number) {
    const cart = Cart.buildCart(customerId);
    return await this.cartRepo.createCart(cart);
  }

  private async getItemByIdOrFail(itemId: number) {
    const item = await this.menuRepo.getItemById(itemId);
    if (!item) {
      throw new ApplicationError(ErrMessages.item.ItemNotFound, StatusCodes.NOT_FOUND);
    }
    return item;
  }

  private async getCart(customerId: number) {
    return await this.cartRepo.getCartByCustomerId(customerId);
  }

  private async getCurrentRestaurantOfCart(cartId: number) {
    const cartItem = await this.dataSource.getRepository(CartItem).findOne({
      where: { cartId },
      order: { cartItemId: 'ASC' }
    });
    return cartItem?.restaurantId ?? null;
  }

  private async isItemExistOnCart(cartId: number, itemId: number) {
    const existing = await this.cartRepo.getCartItem({ cartId, itemId });
    return !!existing;
  }

  private async validateItemBelongsToRestaurant(restaurantId: number, itemId: number): Promise<void> {
    const item = await this.dataSource
      .getRepository(MenuItem)
      .createQueryBuilder('menuItem')
      .innerJoin('menuItem.menu', 'menu', 'menuItem.menuId = menu.menuId')
      .innerJoin('menu.restaurant', 'restaurant', 'menu.restaurantId = restaurant.restaurantId')
      .where('menuItem.itemId = :itemId', { itemId })
      .andWhere('menu.isActive = true')
      .andWhere('restaurant.restaurantId = :restaurantId', { restaurantId })
      .getOne();

    if (!item) {
      throw new ApplicationError(ErrMessages.menu.ItemNotBelongToActiveMenu, StatusCodes.BAD_REQUEST);
    }
  }

  private cartItemReturn(item: CartItem): CartItemResponse {
    return {
      cartId: item.cartId,
      cartItemId: item.cartItemId,
      itemId: item.itemId,
      itemName: item.item?.name || '',
      imagePath: item.item?.imagePath || '',
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      isAvailable: item.item?.isAvailable ?? true,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurant?.name || ''
    };
  }

  private cartResponse(cart: Cart, items: CartItemResponse[]): CartResponse {
    const restaurant = { id: items[0].restaurantId!, name: items[0].restaurantName! };
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      id: cart.cartId,
      customerId: cart.customerId,
      restaurant,
      items,
      totalItems,
      totalPrice: totalPrice.toFixed(2),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
  }

}
