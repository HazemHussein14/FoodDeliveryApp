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

	// TODO:   // why where
	/**
  role entity
  user type
  user entity
   */
	@OneToMany(() => UserRole, (userRole) => userRole.role)
	userRoles!: UserRole[];
}
