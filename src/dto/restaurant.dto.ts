export interface AddRestaurantUserDto {
	userId: number;
	permissions: string[]; // Only restaurant-specific permissions
	addedBy: number;
}

export interface UpdateRestaurantUserDto {
	permissions?: string[];
	isActive?: boolean;
}
