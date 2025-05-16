import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Cart } from './cart.entity';
import { MenuItem } from '../menu/menu-item.entity';

@Entity()
@Unique(['cartId', 'menuItemId'])
export class CartItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartItemId!: number;

	@Column()
	cartId!: number;

	@Column()
	menuItemId!: number;

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

	@ManyToOne(() => Cart, (cart) => cart.items)
	@JoinColumn({ name: 'cart_id' })
	cart!: Cart;

	@ManyToOne(() => MenuItem)
	@JoinColumn({ name: 'menu_item_id' })
	menuItem!: MenuItem;
}
