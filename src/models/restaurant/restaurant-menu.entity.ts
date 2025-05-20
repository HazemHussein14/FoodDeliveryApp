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
import { Restaurant } from './restaurant.entity';
import { Menu } from '../menu/menu.entity';

@Entity()
export class RestaurantMenu extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantMenuId!: number;

	@Column()
	restaurantId!: number;

	@ManyToOne(() => Restaurant)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@Column()
	menuId!: number;

	@ManyToOne(() => Menu)
	@JoinColumn({ name: 'menu_id' })
	menu!: Menu;

	@Column({ default: 0 })
	displayOrder!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
