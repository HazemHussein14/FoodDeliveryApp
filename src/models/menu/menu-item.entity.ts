import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Menu } from './menu.entity';
import { Item } from './item.entity';
import { AbstractEntity } from '../base.entity';
import { AddItemsToMenuRequestDTO } from '../../dto/menu.dto';

@Entity()
@Unique(['menuId', 'itemId'])
export class MenuItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuItemId!: number;

	@Column()
	menuId!: number;

	@Column()
	itemId!: number;

	@ManyToOne(() => Menu, (menu) => menu.menuItems)
	@JoinColumn({ name: 'menu_id' })
	menu!: Menu;

	@ManyToOne(() => Item, (item) => item.menuItems)
	@JoinColumn({ name: 'item_id' })
	item!: Item;

	/**
	 * Builds an array of partial MenuItem objects from provided items.
	 *
	 * @param menuId - The ID of the menu to which the items will be added.
	 * @param items - An array of Item objects to be converted into MenuItem entries.
	 * @returns An array of Partial<MenuItem> objects with menuId and itemId properties.
	 */

	static buildMenuItems(menuId: number, items: AddItemsToMenuRequestDTO['items']): Partial<MenuItem>[] {
		return items.map((item) => ({
			menuId,
			itemId: item
		}));
	}
}
