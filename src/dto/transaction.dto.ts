export interface TransactionDto {
	customerId: number;
	paymentMethodId: number;
	orderId: number | null;
	amount: number;
	transactionStatusId: number;
	transactionCode: string;
}

export interface ProcessPaymentDto {
	orderId: number;
	amount: number;
}
