export interface ViewOrderStatusResponseDto {
	orderId: string;
	status: {
		id: number;
		name: string;
	};
	updatedAt: string;
	deliveredAt: string;
}

export interface AddOrderRatingDto {
	rating?: number;
	comment?: string;
}

interface OrderHistoryItemDto {
	name: string;
	quantity: number;
	price: number;
}

export interface OrderHistoryDto {
	orderId: number;
	orderStatus: string;
	restaurantName: string;
	deliveryAddress: string;
	totalAmount: number;
	placedAt: Date;
	deliveredAt?: Date | null;
	items: OrderHistoryItemDto[];
	paymentMethod: string;
	customerRating?: number | null;
	customerComment?: string | null;
}

export interface AddAddressDto {
	addressLine1: string;
	addressLine2: string;
	city: string;
	isDefault: boolean;
}

export interface AddressDto {
	addressId: number;
	addressLine1: string;
	addressLine2: string;
	city: string;
	isDefault: boolean;
}

export interface UpdateAddressDto {
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	isDefault?: boolean;
}
