import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class TransactionDetail extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionDetailId!: number;

	@Column()
	transactionId!: number;

	@ManyToOne(() => Transaction)
	@JoinColumn({ name: 'transaction_id' })
	transaction!: Transaction;

	@Column({ type: 'jsonb' })
	detailKey!: Record<string, any>;

	@Column({ type: 'jsonb' })
	detailValue!: Record<string, any>;

	@CreateDateColumn()
	createdAt!: Date;
}
