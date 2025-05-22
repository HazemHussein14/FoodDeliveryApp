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
}
