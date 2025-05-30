import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { Cart, CartItem, Customer } from '../models';
import logger from '../config/logger';
import { CartRepository, CustomerRepository, MenuRepository } from '../repositories';
import { CartAddItemDto, CartItemResponse, CartResponse } from '../dto/cart.dto';
import { Transactional } from 'typeorm-transactional';
import { RemoveCartItemDto } from '../dto/cart-item.dto';

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();
	private customerRepo = new CustomerRepository();

	private async getCustomerByUserId(userId: number): Promise<Customer> {
		const customer = await this.customerRepo.getCustomerByUserId(userId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}
		return customer;
	}

	private async getCartById(cartId: number): Promise<Cart> {
		const cart = await this.cartRepo.getCartById(cartId);
		if (!cart) {
			throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		}
		return cart;
	}

	private async getCartItemById(cartItemId: number) {
		const cartItem = await this.cartRepo.getCartItem({ cartItemId });
		if (!cartItem) {
			throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);
		}

		return cartItem;
	}

	private validateCartItemBelongsToCart(cartItemCartId: number, cartId: number) {
		if (cartItemCartId !== cartId) {
			throw new ApplicationError(ErrMessages.cart.CartItemDoesNotBelongToCart, StatusCodes.BAD_REQUEST);
		}
	}

	private async validateCartItem(cartItemId: number, cartId: number) {
		const cartItem = await this.getCartItemById(cartItemId);

		this.validateCartItemBelongsToCart(cartItem.cartId, cartId);
	}

	private async validateCartBelongsToCustomer(
		userId: number,
		cartId?: number
	): Promise<{ customer: Customer; cart: Cart }> {
		const customer = await this.getCustomerByUserId(userId);

		let cart: Cart | null;
		if (cartId) {
			cart = await this.getCartById(cartId);
			if (cart.customerId !== customer.customerId) {
				throw new ApplicationError(ErrMessages.http.Unauthorized, StatusCodes.FORBIDDEN);
			}
		} else {
			cart = await this.cartRepo.getCartByCustomerId(customer.customerId);
			if (!cart) {
				throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
			}
		}

		return { customer, cart };
	}

	async viewCart(userId: number): Promise<CartResponse> {
		const { cart } = await this.validateCartBelongsToCustomer(userId);
		const cartItems = await this.cartRepo.getCartItems(cart.cartId);
		const items = cartItems.map((item) => this.cartItemReturn(item));
		return this.cartResponse(cart, items);
	}

	@Transactional()
	async removeItem(removeCartItemDto: RemoveCartItemDto) {
		logger.info(`Starting removal of cart item ${removeCartItemDto.cartItemId}`);

		// Get user's cart
		const { cart } = await this.validateCartBelongsToCustomer(removeCartItemDto.userId);

		// Validate cart item exists and belongs to this cart
		await this.validateCartItem(removeCartItemDto.cartItemId, cart.cartId);

		await this.cartRepo.deleteCartItem(removeCartItemDto.cartItemId);
		logger.info(`Successfully removed cart item ${removeCartItemDto.cartItemId}`);
	}

	@Transactional()
	async clearCart(userId: number): Promise<void> {
		logger.info(`Clearing cart for user ${userId}`);

		const { cart } = await this.validateCartBelongsToCustomer(userId);

		await this.cartRepo.deleteAllCartItems(cart.cartId);
	}

	@Transactional()
	async updateCartQuantities(userId: number, cartItemId: number, quantity: number): Promise<void> {
		logger.info(`Updating item quantity for user ${userId}`, { cartItemId, quantity });

		if (quantity <= 0) {
			throw new ApplicationError('Quantity must be greater than 0', StatusCodes.BAD_REQUEST);
		}

		const { cart } = await this.validateCartBelongsToCustomer(userId);

		await this.validateCartItem(cartItemId, cart.cartId);

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
	@Transactional()
	async addItemToCart(payload: CartAddItemDto): Promise<CartResponse> {
		const { customerId, restaurantId, itemId, quantity } = payload;

		// 1. Check if item exists
		const item = await this.getItemByIdOrFail(itemId);

		// 2. Get or create cart
		let cart = await this.getCartByCustomerId(customerId);
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

	private async getCartByCustomerId(customerId: number) {
		return await this.cartRepo.getCartByCustomerId(customerId);
	}

	private async getCurrentRestaurantOfCart(cartId: number) {
		return await this.cartRepo.getCurrentRestaurantOfCart(cartId);
	}

	private async isItemExistOnCart(cartId: number, itemId: number) {
		const existing = await this.cartRepo.getCartItem({ cartId, itemId });
		return !!existing;
	}

	private async validateItemBelongsToRestaurant(restaurantId: number, itemId: number): Promise<void> {
		const item = await this.menuRepo.getItemByRestaurant(restaurantId, itemId);

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
		const restaurant = items.length > 0 ? { id: items[0].restaurantId!, name: items[0].restaurantName! } : null;
		const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

		return {
			id: cart.cartId,
			customerId: cart.customerId,
			restaurant,
			items,
			totalPrice: totalPrice.toFixed(2),
			createdAt: cart.createdAt,
			updatedAt: cart.updatedAt
		};
	}
}
