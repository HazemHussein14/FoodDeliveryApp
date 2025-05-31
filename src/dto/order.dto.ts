// Place order DTO
export interface PlaceOrderDto {
	userId: number; // from the auth middleware
	deliveryAddressId: number;
	paymentMethodId: number;
	customerInstructions?: string;
}

export interface PlaceOrderResponse {
	orderId: number;
	status: string;
	totalAmount: number;
	estimatedDeliveryTime?: string;
	paymentStatus: string;
	restaurant: {
		id: number;
		name: string;
	};
	deliveryAddress: {
		addressLine1: string;
		addressLine2: string;
		city: string;
	};
	orderItems: OrderItemResponse[];
}

export interface OrderItemResponse {
	orderItemId: number;
	itemName: string;
	quantity: number;
	itemPrice: number;
	totalPrice: number;
}

// Create Order DTO
export interface OrderDto {
	customerId: number;
	restaurantId: number;
	deliveryAddressId: number;
	customerInstructions: string;
	totalItemsQty: number;
	totalItemsAmount: number;
	serviceFees: number;
	deliveryFees: number;
	totalAmount: number;
	placedAt: Date;
}

// Create Order Item Dto
export interface OrderItemDto {
	orderId: number;
	menuItemId: number;
	quantity: number;
	itemPrice: number;
	totalPrice: number;
}
