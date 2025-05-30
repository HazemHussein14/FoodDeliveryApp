import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { UserRole } from './user-role.entity';

@Entity()
export class Role extends AbstractEntity {
	@PrimaryGeneratedColumn()
	roleId!: number;

	@Column({ type: 'varchar', length: 100, unique: true })
	name!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => UserRole, (userRole) => userRole.role)
	userRoles!: UserRole[];
}
