import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Menu } from './menu.entity';
import { Item } from './item.entity';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
@Unique(['menuId', 'itemId'])
export class MenuItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuItemId!: number;

	@Column()
	menuId!: number;

	@Column()
	itemId!: number;

	@ManyToOne(() => Menu, (menu) => menu.items)
	@JoinColumn({ name: 'menu_id' })
	menu!: Menu;

	@ManyToOne(() => Item, (item) => item.menuItems)
	@JoinColumn({ name: 'item_id' })
	item!: Item;
}
