import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { TransactionDto } from '../dto';
import { ApplicationError, ErrMessages } from '../errors';
import { Transaction, TransactionDetail, PaymentMethod, TransactionStatus } from '../models';
import { Repository } from 'typeorm';
import { TransactionStatusEnum } from '../enums';

export class PaymentRepository {
	private readonly transactionRepo: Repository<Transaction>;
	private readonly transactionDetailRepo: Repository<TransactionDetail>;
	private readonly paymentMethodRepo: Repository<PaymentMethod>;
	private readonly transactionStatusRepo: Repository<TransactionStatus>;

	constructor() {
		this.transactionRepo = AppDataSource.getRepository(Transaction);
		this.transactionDetailRepo = AppDataSource.getRepository(TransactionDetail);
		this.paymentMethodRepo = AppDataSource.getRepository(PaymentMethod);
		this.transactionStatusRepo = AppDataSource.getRepository(TransactionStatus);
	}

	// Transaction operations
	async createTransaction(transactionDto: TransactionDto): Promise<Transaction> {
		try {
			// Get the transaction status ID first
			const transactionStatus = await this.getTransactionStatusByStatusName(transactionDto.transactionStatus);

			// Build the transaction with proper status ID
			const transaction = Transaction.buildTransaction(transactionDto, transactionStatus.transactionStatusId);

			// Save and return
			return await this.transactionRepo.save(transaction);
		} catch (error) {
			logger.error(`Error creating transaction: ${error}`);
			throw error;
		}
	}

	async getTransactionById(transactionId: number): Promise<Transaction | null> {
		return await this.transactionRepo.findOne({
			where: { transactionId }
		});
	}

	async getTransactionsByCustomerId(customerId: number): Promise<Transaction[]> {
		return await this.transactionRepo.find({
			where: { customerId }
		});
	}

	async getTransactionsByOrderId(orderId: number): Promise<Transaction[]> {
		return await this.transactionRepo.find({
			where: { orderId }
		});
	}

	async updateTransaction(transactionId: number, data: Partial<Transaction>): Promise<Transaction | null> {
		await this.transactionRepo.update(transactionId, data);
		return await this.getTransactionById(transactionId);
	}

	async updateTransactionStatus(transactionId: number, status: TransactionStatusEnum): Promise<Transaction | null> {
		const statusName = await this.getTransactionStatusByStatusName(status);
		await this.transactionRepo.update(transactionId, {
			status,
			transactionStatusId: statusName.transactionStatusId
		});
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
	async getAllTransactionStatuses(): Promise<TransactionStatus[]> {
		return await this.transactionStatusRepo.find({
			where: { isActive: true }
		});
	}

	async getTransactionStatusById(transactionStatusId: number): Promise<TransactionStatus | null> {
		return await this.transactionStatusRepo.findOne({
			where: { transactionStatusId }
		});
	}

	async getTransactionStatusByStatusName(statusName: TransactionStatusEnum): Promise<TransactionStatus> {
		const status = await this.transactionStatusRepo.findOne({
			where: { status: statusName }
		});

		if (!status) {
			throw new ApplicationError(ErrMessages.order.OrderStatusNotFound, StatusCodes.NOT_FOUND);
		}

		return status;
	}

	// Helper methods
	async getTransactionByCode(transactionCode: string): Promise<Transaction | null> {
		return await this.transactionRepo.findOne({
			where: { transactionCode }
		});
	}
}
