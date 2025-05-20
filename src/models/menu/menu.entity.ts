import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
export class Menu extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuId!: number;

	@Column({ length: 100 })
	menuTitle!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
