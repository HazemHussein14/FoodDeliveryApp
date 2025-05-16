import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class PaymentStatus extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentStatusId!: number;

	@Column({ type: 'varchar', length: 20 })
	statusName!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Transaction, (transaction) => transaction.paymentStatus)
	transactions!: Transaction[];
}
