import { CartRepository } from '../repositories/cart.repository';

export class CartService {
	private cartRepo = new CartRepository();

	async createCart(data: any) {
		const cart = await this.cartRepo.createCart(data);
		return cart;
	}

	async viewCart(customerId: number) {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		if (!cart) throw new Error('Cart not found');
		return cart;
	}

}
