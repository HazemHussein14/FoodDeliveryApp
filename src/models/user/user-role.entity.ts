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
import { AbstractEntity } from '../base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity()
@Unique(['userId', 'roleId'])
export class UserRole extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userRoleId!: number;

	@Column()
	userId!: number;

	@ManyToOne(() => User, (user) => user.userRoles)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column()
	roleId!: number;

	@ManyToOne(() => Role, (role) => role.userRoles)
	@JoinColumn({ name: 'role_id' })
	role!: Role;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
