export interface TransactionDto {
	customerId: number;
	paymentMethodId: number;
	orderId: number | null;
	amount: number;
	paymentStatusId: number;
	transactionCode: string;
}

export interface ProcessPaymentDto {
	orderId: number;
	amount: number;
}
