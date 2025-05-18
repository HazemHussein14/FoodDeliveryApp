import { CartRepository } from '../repositories/cart.repository';

export class CartService {
	private cartRepo = new CartRepository();

	async viewCart(customerId: number) {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		if (!cart) throw new Error('Cart not found');
		return cart;
	}

  async updateCart(cartId: number, data: any) {
		const updatedCart = await this.cartRepo.updateCart(cartId, data);
		if (!updatedCart) throw new Error("Cart not found or update failed");
		return updatedCart;
	}
}
