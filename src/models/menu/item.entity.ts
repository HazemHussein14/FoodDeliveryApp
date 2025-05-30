import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { MenuItem } from './menu-item.entity';
import { CartItem } from '../cart/cart-item.entity';

@Entity()
export class Item extends AbstractEntity {
	@PrimaryGeneratedColumn()
	itemId!: number;

	@Column({ type: 'varchar', length: 512, default: '' })
	imagePath!: string;

	@Column({ type: 'varchar', length: 100 })
	name!: string;

	@Column({ type: 'text', default: '' })
	description!: string;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
	energyValCal!: number;

	@Column({ type: 'text', default: '' })
	notes!: string;

	@Column({ default: true })
	isAvailable!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => MenuItem, (menuItem) => menuItem.item)
	menuItems!: MenuItem[];

	@OneToMany(() => CartItem, (cartItem) => cartItem.item)
	cartItems!: CartItem[];
}
