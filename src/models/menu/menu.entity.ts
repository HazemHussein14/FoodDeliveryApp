import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { MenuItem } from './menu-item.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { CreateMenuRequestDTO } from '../../dto/menu.dto';

@Entity()
export class Menu extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuId!: number;

	@Column()
	restaurantId!: number;

	@Column({ type: 'varchar', length: 100 })
	menuTitle!: string;

	@Column({ default: false })
	isActive!: boolean; // represents the current used menu by the restaurant

	@Column({ default: false })
	isDeleted!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => MenuItem, (menuItem) => menuItem.menu)
	menuItems!: MenuItem[];

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.menus)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	static buildMenu(restaurantId: number, menu: Omit<CreateMenuRequestDTO, 'userId'>): Menu {
		const newMenu = new Menu();
		newMenu.menuTitle = menu.menuTitle;
		newMenu.restaurantId = restaurantId;
		return newMenu;
	}
}
