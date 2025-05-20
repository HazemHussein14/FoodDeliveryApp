import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Menu } from './menu.entity';
import { Item } from './item.entity';

@Entity()
export class MenuItem extends AbstractEntity {
	@PrimaryColumn()
	menuId!: number;

	@ManyToOne(() => Menu)
	@JoinColumn({ name: 'menu_id' })
	menu!: Menu;

	@PrimaryColumn()
	itemId!: number;

	@ManyToOne(() => Item)
	@JoinColumn({ name: 'item_id' })
	item!: Item;
}
