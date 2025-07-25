import { TransactionStatusEnum } from '../enums';

export interface TransactionDto {
	customerId: number;
	paymentMethodId: number;
	orderId: number | null;
	amount: number;
	transactionStatus: TransactionStatusEnum;
	transactionCode: string;
}

export interface ProcessPaymentDto {
	orderId: number;
	amount: number;
}
