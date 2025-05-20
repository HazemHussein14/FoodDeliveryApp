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
import { AbstractEntity } from '../../abstract/base.entity';
import { Customer } from '../customer/customer.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
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

	@Column()
	restaurantId!: number;

	@ManyToOne(() => Restaurant)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@Column({ default: 0 })
	totalItems!: number;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => CartItem, (cartItem) => cartItem.cart)
	items!: CartItem[];
}
