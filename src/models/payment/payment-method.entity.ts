import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Transaction } from './transaction.entity';
import { PaymentMethodConfig } from './payment-method-config.entity';

@Entity()
export class PaymentMethod extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentMethodId!: number;

	@Column({ type: 'varchar', length: 50 })
	methodName!: string;

	@Column({ type: 'text', default: '' })
	description!: string;

	@Column({ type: 'varchar', length: 255, default: '' })
	iconUrl!: string;

	@Column({ default: 0 })
	order!: number;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Transaction, (transaction) => transaction.paymentMethod)
	transactions!: Transaction[];

	@OneToMany(() => PaymentMethodConfig, (config) => config.paymentMethod)
	configs!: PaymentMethodConfig[];
}
