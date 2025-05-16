import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	OneToOne
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { UserType } from './user-type.entity';
import { UserRole } from './user-role.entity';
import { Restaurant } from '../restaurant/restaurant.entity';

@Entity()
export class User extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userId!: number;

	@Column({ type: 'varchar', length: 100 })
	name!: string;

	@Column({ type: 'varchar', length: 100, unique: true })
	email!: string;

	@Column({ type: 'varchar', length: 20 })
	phone!: string;

	@Column({ type: 'varchar', length: 250 })
	password!: string;

	@Column({ type: 'boolean', default: true })
	isActive!: boolean;

	@Column()
	userTypeId!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => UserType, (userType) => userType.users)
	@JoinColumn({ name: 'userTypeId' })
	userType!: UserType;

	@OneToMany(() => UserRole, (userRole) => userRole.user)
	userRoles!: UserRole[];

	@OneToOne(() => Restaurant, (restaurant) => restaurant.user)
	restaurant!: Restaurant;
}
