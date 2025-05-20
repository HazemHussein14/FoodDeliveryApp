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
import { AbstractEntity } from '../../abstract/base.entity';
import { RestaurantMenu } from './restaurant-menu.entity';
import { Branch } from './branch.entity';

// Restaurant entity
@Entity()
export class Restaurant extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantId!: number;

	@Column({ unique: true })
	userId!: number;

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

	@OneToMany(() => RestaurantMenu, (restaurantMenu) => restaurantMenu.restaurant)
	menus!: RestaurantMenu[];

	@OneToMany(() => Branch, (branch) => branch.restaurant)
	branches!: Branch[];
}
