export interface CreateMenuRequestDTO {
	userId: number;
	menuTitle: string;
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
	items: number[];
}

export interface RemoveMenuItemRequestDTO {
	userId: number;
	menuId: number;
	itemId: number;
}

export interface MenuResponseDTO {
	menuId: number;
	restaurantId: number;
	menuTitle: string;
	isDefaultMenu: boolean;
	createdAt: string;
	updatedAt: string;
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
