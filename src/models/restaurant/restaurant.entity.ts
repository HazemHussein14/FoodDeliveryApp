import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn,
	OneToMany
} from 'typeorm';
import { User } from '../user/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { AbstractEntity } from '../base.entity';
import { Menu } from '../menu/menu.entity';
import { Order } from '../order/order.entity';
import { RestaurantSetting } from './restaurant-setting.entity';

// Restaurant entity
@Entity()
export class Restaurant extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantId!: number;

	@Column({ unique: true })
	userId!: number;

	@Column({ nullable: true })
	restaurantSettingId!: number;

	@Column({ type: 'varchar', length: 255 })
	name!: string;

	@Column({ type: 'varchar', length: 512, default: '' })
	logoUrl!: string;

	@Column({ type: 'varchar', length: 512, default: '' })
	bannerUrl!: string;

	@Column({ type: 'jsonb' })
	location!: Record<string, any>;

	@Column({ type: 'varchar', length: 6 })
	status!: 'open' | 'busy' | 'pause' | 'closed';

	@Column({ type: 'varchar', length: 20, unique: true })
	commercialRegistrationNumber!: string;

	@Column({ type: 'varchar', length: 15, unique: true })
	vatNumber!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@OneToOne(() => RestaurantSetting)
	@JoinColumn({ name: 'restaurant_setting_id' })
	restaurantSetting!: RestaurantSetting;

	@OneToMany(() => Menu, (menu) => menu.restaurant)
	menus!: Menu[];

	@OneToMany(() => CartItem, (cartItem) => cartItem.restaurant)
	cartItems!: CartItem[];

	@OneToMany(() => Order, (orderOrder) => orderOrder.restaurant)
	orders!: Order[];
}
