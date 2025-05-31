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
import { PaymentStatus } from './payment-status.entity';
import { TransactionDetail } from './transaction-detail.entity';
import { TransactionDto } from '../../dto';

@Entity()
export class Transaction extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionId!: number;

	@Column()
	customerId!: number;

	@ManyToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@Column()
	paymentMethodId!: number;

	@ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transactions)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;

	@Column({ nullable: true })
	orderId!: number | null;

	@ManyToOne(() => Order)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	amount!: number;

	@Column()
	paymentStatusId!: number;

	@ManyToOne(() => PaymentStatus, (paymentStatus) => paymentStatus.transactions)
	@JoinColumn({ name: 'payment_status_id' })
	paymentStatus!: PaymentStatus;

	@Column({ type: 'varchar', length: 100 })
	transactionCode!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => TransactionDetail, (detail) => detail.transaction)
	details!: TransactionDetail[];

	static buildTransaction(transactionDto: TransactionDto): Transaction {
		const transaction = new Transaction();
		transaction.customerId = transactionDto.customerId;
		transaction.paymentMethodId = transactionDto.paymentMethodId;
		transaction.amount = transactionDto.amount;
		transaction.orderId = null; // will be updated after order creation
		transaction.paymentStatusId = 1; // pending status id
		transaction.transactionCode = transactionDto.transactionCode;
		return transaction;
	}
}
