import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Order } from './order.entity';
import { Item } from '../menu/item.entity';

@Entity()
export class OrderItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderItemId!: number;

	@Column()
	orderId!: number;

	@ManyToOne(() => Order)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@Column()
	itemId!: number;

	@ManyToOne(() => Item)
	@JoinColumn({ name: 'item_id' })
	item!: Item;

	@Column()
	quantity!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	itemPrice!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;
}
