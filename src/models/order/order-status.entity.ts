import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
export class OrderStatus extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderStatusId!: number;

	@Column({ length: 100 })
	statusName!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
