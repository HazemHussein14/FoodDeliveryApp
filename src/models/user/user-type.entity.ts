import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { User } from './user.entity';

@Entity()
export class UserType extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userTypeId!: number;

	@Column({ type: 'varchar', length: 100 })
	name!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => User, (user) => user.userType)
	users!: User[];
}
