import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class TransactionStatus extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionStatusId!: number;

	@Column({ type: 'varchar', length: 30 })
	status!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Transaction, (transaction) => transaction.transactionStatus)
	transactions!: Transaction[];
}
