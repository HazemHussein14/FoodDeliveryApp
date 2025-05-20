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
import { Restaurant } from './restaurant.entity';
import { Menu } from '../menu/menu.entity';

@Entity()
@Unique(['restaurantId', 'menuId'])
export class RestaurantMenu extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantMenuId!: number;

	@Column()
	restaurantId!: number;

	@Column()
	menuId!: number;

	@Column({ default: 0 })
	displayOrder!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.menus)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@ManyToOne(() => Menu)
	@JoinColumn({ name: 'menu_id' })
	menu!: Menu;
}
