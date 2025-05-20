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
import { Cart } from './cart.entity';
import { Item } from '../menu/item.entity';

@Entity()
export class CartItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartItemId!: number;

	@Column()
	cartId!: number;

	@ManyToOne(() => Cart)
	@JoinColumn({ name: 'cart_id' })
	cart!: Cart;

	@Column()
	itemId!: number;

	@ManyToOne(() => Item)
	@JoinColumn({ name: 'item_id' })
	item!: Item;

	@Column()
	quantity!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	discount!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
