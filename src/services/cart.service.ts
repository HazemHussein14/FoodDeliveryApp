import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem, Customer, MenuItem } from '../models';
import logger from '../config/logger';
import { CartRepository, CustomerRepository, MenuRepository } from '../repositories';
import { CartAddItemDto, CartItemResponse, CartResponse } from '../dto/cart.dto';
import { Transactional } from 'typeorm-transactional';
import { RemoveCartItemDto } from '../dto/cart-item.dto';

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();
	private customerRepo = new CustomerRepository();

	private dataSource = AppDataSource;

	private async validateCustomer(userId: number): Promise<Customer> {
		const customer = await this.customerRepo.getCustomerByUserId(userId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}
		return customer;
	}

	private async validateCart(customerId: number): Promise<Cart> {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		if (!cart) {
			throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		}
		return cart;
	}

	async viewCart(userId: number): Promise<CartResponse> {
		// Step 1: Validate that the user has a customer profile
		const customer = await this.validateCustomer(userId);

		// Step 2: Get or validate the cart for this customer
		const cart = await this.validateCart(customer.customerId);

		// Step 3: Get cart items
		const cartItems = await this.cartRepo.getCartItems(cart.cartId);

		// Step 4: Prepare the response
		const hasItems = cartItems.length > 0;
		const restaurant =
			cartItems.length > 0 ? { id: cartItems[0].restaurantId!, name: cartItems[0].restaurant?.name || '' } : null;

		const items = cartItems.map((item) => this.cartItemReturn(item));

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

		if (cart.customerId !== removeCartItemDto.customerId) {
			throw new ApplicationError(ErrMessages.http.Unauthorized, StatusCodes.FORBIDDEN);
		}

		const cartItem = await this.cartRepo.getCartItem({ cartItemId: removeCartItemDto.cartItemId });

		if (!cartItem) {
			throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);
		}

		if (cartItem.cartId !== cart.cartId) {
			throw new ApplicationError(ErrMessages.cart.CartItemDoesNotBelongToCart, StatusCodes.BAD_REQUEST);
		}

		logger.info(`Deleting cart item ${removeCartItemDto.cartItemId}`);
		await this.cartRepo.deleteCartItem(removeCartItemDto.cartItemId);

		logger.info(`Successfully removed cart item ${removeCartItemDto.cartItemId} from cart ${removeCartItemDto.cartId}`);
	}

	@Transactional()
	async clearCart(cartId: number) {
		logger.info('clearing cart items', { cartId });

		const cart = await this.cartRepo.getCartById(cartId);
		if (!cart) {
			throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		}

		await this.cartRepo.deleteAllCartItems(cartId);
	}

	@Transactional()
	async updateCartQuantities(cartId: number, cartItemId: number, quantity: number) {
		logger.info('updating item qunatity', { cartId, cartItemId, quantity });

		const cart = await this.cartRepo.getCartById(cartId);
		if (!cart) {
			throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		}

		const cartItems = await this.cartRepo.getCartItems(cartId);
		const item = cart.cartItems.find((item) => item.cartItemId === cartItemId) ?? null;
		if (!item) throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);

		await this.cartRepo.updateCartItem(cartItemId, { quantity });
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
