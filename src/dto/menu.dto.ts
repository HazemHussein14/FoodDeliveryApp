export interface CreateMenuRequestDTO {
	restaurantId: number;
	menuTitle: string;
}

export interface UpdateMenuRequestDTO {
	userId: number;
	menuId: number;
	menuTitle: string;
}

export interface AddItemsToMenuRequestDTO {
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
}
