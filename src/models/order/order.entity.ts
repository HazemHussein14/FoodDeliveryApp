import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { OrderStatus } from './order-status.entity';
import { Branch } from '../restaurant/branch.entity';
import { Cart } from '../cart/cart.entity';
import { Customer } from '../customer/customer.entity';
import { Address } from '../customer/address.entity';

@Entity()
export class Order extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderId!: number;

	@Column()
	orderStatusId!: number;

	@ManyToOne(() => OrderStatus)
	@JoinColumn({ name: 'order_status_id' })
	orderStatus!: OrderStatus;

	@Column()
	branchId!: number;

	@ManyToOne(() => Branch)
	@JoinColumn({ name: 'branch_id' })
	branch!: Branch;

	@Column()
	cartId!: number;

	@ManyToOne(() => Cart)
	@JoinColumn({ name: 'cart_id' })
	cart!: Cart;

	@Column()
	customerId!: number;

	@ManyToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@Column()
	deliveryAddressId!: number;

	@ManyToOne(() => Address)
	@JoinColumn({ name: 'delivery_address_id' })
	deliveryAddress!: Address;

	@Column({ type: 'text', default: '' })
	customerInstructions!: string;

	@Column()
	totalItems!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalItemsAmount!: number;

	@Column({ type: 'decimal', precision: 5, scale: 2 })
	deliveryFees!: number;

	@Column({ type: 'decimal', precision: 5, scale: 2 })
	serviceFees!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	discount!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalAmount!: number;

	@Column()
	placedAt!: Date;

	@Column()
	deliveredAt!: Date;

	@Column({
		type: 'enum',
		enum: ['customer', 'restaurant', 'system', 'driver'],
		nullable: true
	})
	cancelledBy?: 'customer' | 'restaurant' | 'system' | 'driver';

	@Column({ type: 'text', default: '' })
	cancellationReason!: string;

	@Column({ nullable: true })
	cancelledAt?: Date;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
