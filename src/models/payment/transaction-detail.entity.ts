import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
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
	detailKey!: any;

	@Column({ type: 'jsonb' })
	detailValue!: any;

	@CreateDateColumn()
	createdAt!: Date;
}
