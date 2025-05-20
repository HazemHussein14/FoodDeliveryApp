import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity()
export class UserRole extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userRoleId!: number;

	@Column()
	userId!: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column()
	roleId!: number;

	@ManyToOne(() => Role)
	@JoinColumn({ name: 'role_id' })
	role!: Role;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
