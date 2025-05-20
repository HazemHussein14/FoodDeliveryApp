import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
export class Role extends AbstractEntity {
	@PrimaryGeneratedColumn()
	roleId!: number;

	@Column({ unique: true, length: 100 })
	name!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
