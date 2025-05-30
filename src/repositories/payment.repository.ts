import { AppDataSource } from '../config/data-source';
import { Transaction, TransactionDetail, PaymentMethod, PaymentStatus } from '../models';
import { Repository } from 'typeorm';

export class PaymentRepository {
	private transactionRepo: Repository<Transaction>;
	private transactionDetailRepo: Repository<TransactionDetail>;
	private paymentMethodRepo: Repository<PaymentMethod>;
	private paymentStatusRepo: Repository<PaymentStatus>;

	constructor() {
		this.transactionRepo = AppDataSource.getRepository(Transaction);
		this.transactionDetailRepo = AppDataSource.getRepository(TransactionDetail);
		this.paymentMethodRepo = AppDataSource.getRepository(PaymentMethod);
		this.paymentStatusRepo = AppDataSource.getRepository(PaymentStatus);
	}

	// Transaction operations
	async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
		const transaction = this.transactionRepo.create(data);
		return await this.transactionRepo.save(transaction);
	}

	async getTransactionById(transactionId: number): Promise<Transaction | null> {
		return await this.transactionRepo.findOne({
			where: { transactionId },
			relations: ['customer', 'paymentMethod', 'order', 'paymentStatus']
		});
	}

	async getTransactionsByCustomerId(customerId: number): Promise<Transaction[]> {
		return await this.transactionRepo.find({
			where: { customerId },
			relations: ['customer', 'paymentMethod', 'order', 'paymentStatus'],
			order: { createdAt: 'DESC' }
		});
	}

	async getTransactionsByOrderId(orderId: number): Promise<Transaction[]> {
		return await this.transactionRepo.find({
			where: { orderId },
			relations: ['customer', 'paymentMethod', 'order', 'paymentStatus']
		});
	}

	async updateTransaction(transactionId: number, data: Partial<Transaction>): Promise<Transaction | null> {
		await this.transactionRepo.update(transactionId, data);
		return await this.getTransactionById(transactionId);
	}

	async updateTransactionStatus(transactionId: number, paymentStatusId: number): Promise<Transaction | null> {
		await this.transactionRepo.update(transactionId, { paymentStatusId });
		return await this.getTransactionById(transactionId);
	}

	// Transaction Detail operations
	async addTransactionDetail(data: Partial<TransactionDetail>): Promise<TransactionDetail> {
		const detail = this.transactionDetailRepo.create(data);
		return await this.transactionDetailRepo.save(detail);
	}

	async getTransactionDetails(transactionId: number): Promise<TransactionDetail[]> {
		return await this.transactionDetailRepo.find({
			where: { transactionId },
			relations: ['transaction']
		});
	}

	// Payment Method operations
	async getAllPaymentMethods(): Promise<PaymentMethod[]> {
		return await this.paymentMethodRepo.find({
			where: { isActive: true },
			order: { order: 'ASC' }
		});
	}

	async getPaymentMethodById(paymentMethodId: number): Promise<PaymentMethod | null> {
		return await this.paymentMethodRepo.findOne({
			where: { paymentMethodId }
		});
	}

	// Payment Status operations
	async getAllPaymentStatuses(): Promise<PaymentStatus[]> {
		return await this.paymentStatusRepo.find({
			where: { isActive: true }
		});
	}

	async getPaymentStatusById(paymentStatusId: number): Promise<PaymentStatus | null> {
		return await this.paymentStatusRepo.findOne({
			where: { paymentStatusId }
		});
	}

	// Helper methods
	async getTransactionByCode(transactionCode: string): Promise<Transaction | null> {
		return await this.transactionRepo.findOne({
			where: { transactionCode },
			relations: ['customer', 'paymentMethod', 'order', 'paymentStatus']
		});
	}
}
