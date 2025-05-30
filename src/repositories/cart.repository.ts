import { AppDataSource } from '../config/data-source';
import { Cart, CartItem } from '../models';
import { Repository } from 'typeorm';

export class CartRepository {
	private cartRepo: Repository<Cart>;
	private cartItemRepo: Repository<CartItem>;

	constructor() {
		this.cartRepo = AppDataSource.getRepository(Cart);
		this.cartItemRepo = AppDataSource.getRepository(CartItem);
	}

	// Cart operations
	async createCart(data: Partial<Cart>): Promise<Cart> {
		const cart = this.cartRepo.create(data);
		return await this.cartRepo.save(cart);
	}

	async getCartById(cartId: number): Promise<Cart | null> {
		return await this.cartRepo.findOne({
			where: { cartId }
		});
	}

	async getCartByCustomerId(customerId: number): Promise<Cart | null> {
		return await this.cartRepo.findOne({
			where: { customerId }
		});
	}

	async updateCart(cartId: number, data: Partial<Cart>): Promise<Cart | null> {
		await this.cartRepo.update(cartId, data);
		return await this.getCartById(cartId);
	}

	async deleteCart(cartId: number): Promise<void> {
		await this.cartRepo.delete(cartId);
	}

	// Cart Item operations
	async addCartItem(data: Partial<CartItem>): Promise<CartItem> {
		const cartItem = this.cartItemRepo.create(data);
		return await this.cartItemRepo.save(cartItem);
	}

	async getCartItems(cartId: number): Promise<CartItem[]> {
		return await this.cartItemRepo.find({
			where: { cartId }
		});
	}

	async getCartItemById(cartItemId: number): Promise<CartItem | null> {
		return await this.cartItemRepo.findOne({
			where: { cartItemId }
		});
	}

	async getCurrentRestaurantOfCart(cartId: number) {
		const cartItem = await this.cartItemRepo.findOne({
			where: { cartId },
			order: { cartItemId: 'ASC' }
		});
		return cartItem?.restaurantId ?? null;
	}

	async updateCartItem(cartItemId: number, data: Partial<CartItem>): Promise<CartItem | null> {
		await this.cartItemRepo.update(cartItemId, data);
		return await this.getCartItemById(cartItemId);
	}

	async deleteCartItem(cartItemId: number): Promise<void> {
		await this.cartItemRepo.delete(cartItemId);
	}

	async deleteAllCartItems(cartId: number): Promise<void> {
		await this.cartItemRepo.delete({ cartId });
	}

	async getCartItem(filter: { cartId?: number; itemId?: number; cartItemId?: number }): Promise<CartItem | null> {
		if (!Object.keys(filter).length) return null;

		const cartItem = await this.cartItemRepo.findOne({
			where: { ...filter },
			relations: ['item']
		});

		return cartItem || null;
	}
}
