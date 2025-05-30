import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Order } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';

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
}
