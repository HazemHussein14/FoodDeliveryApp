import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
export class UserType extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userTypeId!: number;

	@Column({ length: 100 })
	name!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
