import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { PaymentMethod } from './payment-method.entity';
import { Order } from '../order/order.entity';
import { TransactionStatus } from './transaction-status.entity';
import { TransactionDetail } from './transaction-detail.entity';
import { TransactionDto } from '../../dto';
import { TransactionStatusEnum } from '../../enums';

@Entity()
export class Transaction extends AbstractEntity {
	// Primary Key
	@PrimaryGeneratedColumn()
	transactionId!: number;

	// Foreign Keys
	@Column()
	customerId!: number;

	@Column()
	paymentMethodId!: number;

	@Column({ nullable: true })
	orderId!: number | null;

	@Column()
	transactionStatusId!: number;

	// Basic Info
	@Column()
	status!: TransactionStatusEnum;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	amount!: number;

	@Column({ type: 'varchar', length: 100 })
	transactionCode!: string;

	// Timestamps
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	// Relations
	@ManyToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transactions)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;

	@ManyToOne(() => Order)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@ManyToOne(() => TransactionStatus, (transactionStatus) => transactionStatus.transactions)
	@JoinColumn({ name: 'transaction_status_id' })
	transactionStatus!: TransactionStatus;

	@OneToMany(() => TransactionDetail, (detail) => detail.transaction)
	details!: TransactionDetail[];

	/**
	 * Creates a new Transaction instance from a TransactionDto, with the provided transactionStatusId.
	 * @param transactionDto - The TransactionDto to build the Transaction from.
	 * @param transactionStatusId - The ID of the TransactionStatus to assign to the new Transaction.
	 * @returns The new Transaction instance.
	 */
	static buildTransaction(transactionDto: TransactionDto, transactionStatusId: number): Transaction {
		const transaction = new Transaction();
		transaction.customerId = transactionDto.customerId;
		transaction.paymentMethodId = transactionDto.paymentMethodId;
		transaction.amount = transactionDto.amount;
		transaction.orderId = transactionDto.orderId;
		transaction.transactionStatusId = transactionStatusId;
		transaction.status = transactionDto.transactionStatus;
		transaction.transactionCode = transactionDto.transactionCode;
		return transaction;
	}
}
