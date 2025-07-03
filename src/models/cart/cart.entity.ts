import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartId!: number;

	@Column()
	customerId!: number;

	@ManyToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => CartItem, (cartItem) => cartItem.cart)
	cartItems!: CartItem[];

	/**
	 * Builder method to create a Cart instance with a customerId.
	 * @param customerId - ID of the customer
	 * @returns A new Cart instance
	 */
	static buildCart(customerId: number) {
		const cart = new Cart();
		cart.customerId = customerId;
		return cart;
	}

	/**
	 * Calculates the total quantity of items and the total amount for the given cart items.
	 *
	 * @param cartItems - Array of CartItem instances
	 * @returns An object containing totalItemsQty (total quantity of all items) and
	 *          totalItemsAmount (total amount for all items, rounded to two decimal places)
	 */
	static calculateTotalItemsAmountAndQty(cartItems: CartItem[]) {
		let totalItemsQty = 0;
		let totalItemsAmount = 0;
		for (const item of cartItems) {
			totalItemsAmount += item.calculateTotalPrice();
			totalItemsQty += item.quantity;
		}
		return { totalItemsQty, totalItemsAmount: parseFloat(totalItemsAmount.toFixed(2)) };
	}
}
