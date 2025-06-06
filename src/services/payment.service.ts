import { PaymentRepository } from '../repositories';
import { Transaction } from '../models';
import logger from '../config/logger';
import { ProcessPaymentDto, TransactionDto } from '../dto';

export class PaymentService {
	private paymentRepository = new PaymentRepository();

	async createPendingTransaction(data: { customerId: number; amount: number; paymentMethodId: number }) {
		const transactionDto: TransactionDto = {
			customerId: data.customerId,
			amount: data.amount,
			paymentMethodId: data.paymentMethodId,
			orderId: null,
			transactionStatusId: 1, // pending status id
			transactionCode: this.generateTransactionCode()
		};
		logger.info(`Creating pending transaction for customer ${transactionDto.customerId}`);

		const transaction = Transaction.buildTransaction(transactionDto);

		return await this.paymentRepository.createTransaction(transaction);
	}

	async processPayment(transactionId: number, processPaymentDto: ProcessPaymentDto) {
		logger.info(`Processing payment for transaction ${transactionId}`);

		try {
			// Update transaction with order ID
			await this.paymentRepository.updateTransaction(transactionId, {
				orderId: processPaymentDto.orderId
			});

			// TODO: Integrate with payment gateway
			const paymentResult = await this.processPaymentGateway(processPaymentDto.amount);

			if (paymentResult.success) {
				await this.paymentRepository.updateTransactionStatus(transactionId, 2); // success status id
				await this.paymentRepository.addTransactionDetail({
					transactionId,
					details: { ...paymentResult.data }
				});
			} else {
				await this.markTransactionAsFailed(transactionId, paymentResult.error || 'Payment gateway error');
			}

			return paymentResult;
		} catch (error: any) {
			logger.error(`Payment processing failed for transaction ${transactionId}:`, error);

			await this.markTransactionAsFailed(transactionId, error.message);
			throw error;
		}
	}

	async markTransactionAsFailed(transactionId: number, reason: string) {
		await this.paymentRepository.updateTransactionStatus(transactionId, 3); // failure status id
		await this.paymentRepository.addTransactionDetail({
			transactionId,
			details: { error: reason }
		});
	}

	private async processPaymentGateway(amount: number) {
		// TODO: Replace with actual payment gateway integration.
		// for now, simulate payment processing

		await new Promise((resolve) => setTimeout(resolve, 1000));

		// simulate success/failure (50% success rate)
		const success = Math.random() > 0.5;

		return {
			success,
			data: success
				? {
						gatewayTransactionId: `GW-${Date.now()}`,
						amount
					}
				: null,
			error: success ? null : 'Payment gateway error'
		};
	}

	private generateTransactionCode(): string {
		return `TXN-${Date.now()}-${Math.random().toString(36).toUpperCase()}`;
	}
}
