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
import { OrderStatus } from './order-status.entity';
import { Cart } from '../cart/cart.entity';
import { Customer } from '../customer/customer.entity';
import { Address } from '../customer/address.entity';
import { OrderItem } from './order-item.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { OrderDto } from '../../dto/order.dto';

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
	restaurantId!: number;

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

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
	customerInstructions!: string | undefined;

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

	// Made nullable since orders won't have delivery date when first created
	@Column({ type: 'timestamp', nullable: true })
	deliveredAt?: Date | null;

	// Made nullable since not all orders will have cancellation info
	@Column({ type: 'jsonb', nullable: true })
	cancellationInfo?: Record<string, any> | null;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	items!: OrderItem[];

	static buildOrder(createOrderDto: OrderDto) {
		const order = new Order();
		order.customerId = createOrderDto.customerId;
		order.restaurantId = createOrderDto.restaurantId;
		order.deliveryAddressId = createOrderDto.deliveryAddressId;
		order.customerInstructions = createOrderDto.customerInstructions;
		order.totalItems = createOrderDto.totalItemsQty;
		order.totalItemsAmount = createOrderDto.totalItemsAmount;
		order.deliveryFees = createOrderDto.deliveryFees;
		order.serviceFees = createOrderDto.serviceFees;
		order.totalAmount = createOrderDto.totalAmount;
		order.orderStatusId = createOrderDto.orderStatusId;
		order.discount = createOrderDto.discount;
		order.placedAt = createOrderDto.placedAt;
		// deliveredAt and cancellationInfo will be null initially
		order.deliveredAt = null;
		order.cancellationInfo = null;
		return order;
	}
}
