import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm';
import { Menu } from './menu.entity';
import { Item } from './item.entity';
import { AbstractEntity } from '../base.entity';
import { CartItem } from '../cart/cart-item.entity';

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
}
