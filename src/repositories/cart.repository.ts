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

	async getCartItem(cartItemId: number): Promise<CartItem | null> {
		return await this.cartItemRepo.findOne({
			where: { cartItemId }
		});
	}

	async updateCartItem(cartItemId: number, data: Partial<CartItem>): Promise<CartItem | null> {
		await this.cartItemRepo.update(cartItemId, data);
		return await this.getCartItem(cartItemId);
	}

	async deleteCartItem(cartItemId: number): Promise<void> {
		await this.cartItemRepo.delete(cartItemId);
	}

	async deleteAllCartItems(cartId: number): Promise<void> {
		await this.cartItemRepo.delete({ cartId });
	}

	// Helper methods
	async calculateCartTotal(cartId: number): Promise<number> {
		const cartItems = await this.getCartItems(cartId);
		return cartItems.reduce((total, item) => total + item.totalPrice, 0);
	}

	async updateCartTotalItems(cartId: number): Promise<void> {
		const cartItems = await this.getCartItems(cartId);
		const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
		await this.updateCart(cartId, { totalItems });
	}
}
