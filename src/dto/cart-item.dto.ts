export interface CartItemDto {
	cartId: number;
	restaurantId: number;
	itemId: number;
	quantity: number;
	price: number;
}

export interface RemoveCartItemDto {
	customerId: number;
	cartId: number;
	cartItemId: number;
}
