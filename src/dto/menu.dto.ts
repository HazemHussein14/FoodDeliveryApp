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
