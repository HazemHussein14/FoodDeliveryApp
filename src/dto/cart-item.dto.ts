export interface CartItemDto {
	cartId: number;
	restaurantId: number;
	itemId: number;
	quantity: number;
	price: number;
}

export interface RemoveCartItemDto {
	userId: number;
	cartItemId: number;
}
