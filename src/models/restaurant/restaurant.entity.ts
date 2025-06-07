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

// Interface for restaurant user structure
export interface RestaurantUser {
	userId: number;
	permissions: string[]; // Restaurant-specific permissions only
	isActive: boolean;
	addedAt: Date;
	addedBy: number;
}

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

	@Column({ type: 'jsonb', default: [] })
	restaurantUsers!: RestaurantUser[];

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

	@OneToMany(() => Order, (order) => order.restaurant)
	orders!: Order[];

	/**
	 * Adds a new user to the restaurant's users list.
	 *
	 * @param user - The user object to be added, excluding the 'addedAt' field.
	 *               The 'addedAt' field will be automatically set to the current date.
	 */

	addRestaurantUser(user: Omit<RestaurantUser, 'addedAt'>): void {
		const newUser: RestaurantUser = {
			...user,
			addedAt: new Date()
		};
		this.restaurantUsers = [...this.restaurantUsers, newUser];
	}

	/**
	 * Removes a user from the restaurant's users list.
	 * @param userId - The user ID of the user to be removed.
	 */
	removeRestaurantUser(userId: number): void {
		this.restaurantUsers = this.restaurantUsers.filter((user) => user.userId !== userId);
	}

	/**
	 * Updates a user in the restaurant's users list.
	 *
	 * @param userId - The user ID of the user to be updated.
	 * @param updatedUser - The user object with the fields to be updated.
	 *                      The 'addedAt' and 'userId' fields will be ignored.
	 */
	updateRestaurantUser(userId: number, updates: Partial<RestaurantUser>): void {
		this.restaurantUsers = this.restaurantUsers.map((user) =>
			user.userId === userId ? { ...user, ...updates } : user
		);
	}

	/**
	 * Retrieves a restaurant user by user ID.
	 *
	 * @param userId - The ID of the user to retrieve.
	 * @returns The restaurant user with the specified user ID, or undefined if not found.
	 */

	getRestaurantUserByUserId(userId: number): RestaurantUser | undefined {
		return this.restaurantUsers.find((user) => user.userId === userId);
	}

	/**
	 * Retrieves a list of active restaurant users.
	 *
	 * @returns An array of RestaurantUser objects representing the active users.
	 */

	getActiveRestaurantUsers(): RestaurantUser[] {
		return this.restaurantUsers.filter((user) => user.isActive);
	}

	/**
	 * Checks if a restaurant user has a specific permission.
	 *
	 * @param userId - The ID of the user whose permissions are being checked.
	 * @param permission - The permission to check for the user.
	 * @returns True if the user is active and has the specified permission, false otherwise.
	 */

	hasUserPermission(userId: number, permission: string): boolean {
		const user = this.getRestaurantUserByUserId(userId);
		if (!user) return false;
		return (user?.isActive && user?.permissions.includes(permission)) || false;
	}
}
