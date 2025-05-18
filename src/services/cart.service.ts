import { CartRepository } from '../repositories/cart.repository';

export class CartService {
	private cartRepo = new CartRepository();

	async createCart(data: any) {
		// ممكن تضيفي checks هنا مثلاً لو customer عنده cart active بالفعل
		// أو تتأكدي من صحة البيانات قبل إرسالها للريبو
		const cart = await this.cartRepo.createCart(data);
		return cart;
	}

	async viewCart(customerId: number) {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		if (!cart) throw new Error('Cart not found');
		return cart;
	}

}
