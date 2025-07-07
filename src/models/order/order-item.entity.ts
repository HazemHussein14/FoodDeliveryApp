import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { OrderItemDto } from '../../dto/order.dto';

@Entity()
export class OrderItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderItemId!: number;

	@Column()
	orderId!: number;

	@ManyToOne(() => Order, (order) => order.items)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@Column()
	menuItemId!: number;

	@ManyToOne(() => MenuItem)
	@JoinColumn({ name: 'menu_item_id' })
	menuItem!: MenuItem;

	@Column()
	quantity!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	itemPrice!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;

	/**
	 * Builds an OrderItem instance from the provided OrderItemDto.
	 *
	 * @param OrderItemDto - The DTO containing order item details such as
	 * orderId, menuItemId, quantity, itemPrice, and totalPrice.
	 * @returns A new OrderItem instance initialized with the provided details.
	 */

	static buildOrderItem(OrderItemDto: OrderItemDto) {
		const orderItem = new OrderItem();
		orderItem.orderId = OrderItemDto.orderId;
		orderItem.menuItemId = OrderItemDto.menuItemId;
		orderItem.quantity = OrderItemDto.quantity;
		orderItem.itemPrice = OrderItemDto.itemPrice;
		orderItem.totalPrice = OrderItemDto.totalPrice;
		return orderItem;
	}
}
