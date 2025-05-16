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
import { OrderStatus } from './order-status.entity';
import { Branch } from '../restaurant/branch.entity';
import { Cart } from '../cart/cart.entity';
import { Customer } from '../customer/customer.entity';
import { Address } from '../customer/address.entity';
import { OrderItem } from './order-item.entity';

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

	@Column({ type: 'timestamp' })
	placedAt!: Date;

	@Column({ type: 'timestamp' })
	deliveredAt!: Date;

	@Column({ type: 'jsonb' })
	cancellationInfo!: Record<string, any>;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	items!: OrderItem[];
}
