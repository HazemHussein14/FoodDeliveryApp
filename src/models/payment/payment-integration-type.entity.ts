import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
export class PaymentMethod extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentMethodId!: number;

	@Column({ length: 50 })
	methodName!: string;

	@Column({ type: 'text', default: '' })
	description!: string;

	@Column({ default: '' })
	iconUrl!: string;

	@Column({ default: 0 })
	order!: number;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
