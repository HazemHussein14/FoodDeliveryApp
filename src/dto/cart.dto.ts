export class CartAddItemDto {
	customerId!: number;
	restaurantId!: number;
	itemId!: number;
	quantity!: number;
}

export class FindCartItemFilter {
	cartId?: number;
	itemId?: number;
	cartItemId?: number;
}

export class UpdateQuantityPayload {
	cartItemId!: number;
	quantity!: number;
}

export class CartItemResponse {
	cartId!: number;
	cartItemId!: number;
	restaurantId?: number;
	restaurantName?: string;
	itemId!: number;
	itemName!: string;
	imagePath!: string;
	quantity!: number;
	price!: number;
	totalPrice!: number;
	isAvailable!: boolean;
}

export class CartResponse {
	id!: number;
	customerId!: number;
	restaurant!: {
		id: number;
		name: string;
	} | null;
	items!: CartItemResponse[];
	totalPrice!: string;
	createdAt!: Date;
	updatedAt!: Date;
}
