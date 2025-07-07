export interface CreateMenuRequestDTO {
	userId: number;
	menuTitle: string;
}

export interface MenuResponseDTO {
	menuId: number;
	restaurantId: number;
	menuTitle: string;
	isDefaultMenu: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateMenuRequestDTO {
	userId: number;
	menuId: number;
	menuTitle: string;
}

export interface AddItemsToMenuRequestDTO {
	userId: number;
	restaurantId: number;
	menuId: number;
	items: Array<{ itemId: number }>;
}

export interface MenuItemResponseDTO {
	menuId: number;
	menuItemId: number;
	itemId: number;
	name: string;
	description: string;
	price: number;
	imagePath: string;
	energyValCal: number;
	isAvailable: boolean;
}
