import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
export class PaymentStatus extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentStatusId!: number;

	@Column({ length: 20 })
	statusName!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
