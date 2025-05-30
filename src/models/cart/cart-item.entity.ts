import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Cart } from './cart.entity';
import { Item } from '../menu/item.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { CartItemDto } from '../../dto/cart-item.dto';

@Entity()
@Unique(['cartId', 'itemId'])
export class CartItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartItemId!: number;

	@Column()
	cartId!: number;

	@Column()
	restaurantId!: number;

	@Column()
	itemId!: number;

	@Column()
	quantity!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Cart, (cart) => cart.cartItems)
	@JoinColumn({ name: 'cart_id' })
	cart!: Cart;

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.cartItems)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@ManyToOne(() => Item, (item) => item.cartItems)
	@JoinColumn({ name: 'item_id' })
	item!: Item;

	/**
	 * builder method to create a CartItem instance with calculated values
	 *
	 * @param cartId - ID of the cart
	 * @param itemId - Item ID
	 * @param quantity - Quantity of the menu item
	 * @returns A new CartItem instance
	 */
	static buildCartItem(cartItemDto: CartItemDto) {
		const cartItem = new CartItem();
		cartItem.cartId = cartItemDto.cartId;
		cartItem.restaurantId = cartItemDto.restaurantId;
		cartItem.itemId = cartItemDto.itemId;
		cartItem.price = cartItemDto.price;
		cartItem.quantity = cartItemDto.quantity;

		cartItem.calculateTotalPrice();

		return cartItem;
	}

	/**
	 * Recalculates the total price based on current quantity, price, and discount
	 */
	calculateTotalPrice() {
		this.totalPrice = Number((this.quantity * this.price).toFixed(2));
		return this.totalPrice;
	}

	/**
	 * Updates the quantity of the cart item and recalculates the total price
	 *
	 * @param quantity - New quantity
	 * @returns The updated CartItem instance
	 */
	updateQuantity(quantity: number): CartItem {
		this.quantity = quantity;
		this.calculateTotalPrice();
		return this;
	}
}
