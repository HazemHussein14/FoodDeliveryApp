import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { Transactional } from 'typeorm-transactional';
import { MenuRepository } from '../repositories';
import { Menu, MenuItem, Restaurant } from '../models';
import {
	AddItemsToMenuRequestDTO,
	CreateMenuRequestDTO,
	MenuItemResponseDTO,
	MenuResponseDTO,
	RemoveMenuItemRequestDTO,
	UpdateMenuRequestDTO
} from '../dto/menu.dto';
import { RestaurantService } from './restaurant.service';
import { OrderService } from './order.service';
import { SettingService } from './setting.service';

export class MenuService {
	private readonly menuRepo = new MenuRepository();
	private readonly orderService = new OrderService();
	private readonly restaurantService = new RestaurantService();
	private readonly settingService = new SettingService();

	/**
	 * Creates a new menu for a restaurant.
	 *
	 * @param restaurantId - The id of the restaurant.
	 * @param request - The request to create the menu.
	 *
	 * @returns The created menu.
	 *
	 * @throws {ApplicationError} If restaurant is not active.
	 * @throws {ApplicationError} If restaurant does not belong to the user.
	 * @throws {ApplicationError} If maximum number of menus for the restaurant is exceeded.
	 * @throws {ApplicationError} If a menu with the same title exists for the restaurant.
	 */
	@Transactional()
	async createRestaurantMenu(request: CreateMenuRequestDTO) {
		await this.validateMenuCountAcrossRestaurant(request.restaurantId);

		await this.validateUniqueMenuTitleAcrossRestaurant(request.restaurantId, request.menuTitle);

		const createdMenu = await this.createMenu(request.restaurantId, request);
		return this.buildMenuResponse(createdMenu);
	}

	@Transactional()
	async addItemsToRestaurantMenu(request: AddItemsToMenuRequestDTO) {
		const { menuId, items } = request;

		const menu = await this.getMenuByIdWithItemDetailsOrFail(menuId);

		// Filter out unavailable items
		const availableItems = await this.filterUnavailableItems(items);
		this.validateExistingMenuItems(menu.menuItems, availableItems);

		const createdMenuItems = await this.createMenuItems(menuId, availableItems);
		return createdMenuItems;
	}

	@Transactional()
	async removeItemFromRestaurantMenu(request: RemoveMenuItemRequestDTO): Promise<void> {
		const { menuId, itemId, userId } = request;

		// Validate user owns the restaurant
		const restaurant = await this.restaurantService.validateUserOwnsActiveRestaurant(userId);

		const menu = await this.getMenuByIdWithItemDetailsOrFail(menuId);

		// Validate menu belongs to restaurant
		this.validateMenuBelongsToRestaurant(menu, restaurant.restaurantId);

		// Validate item exists in the menu
		const menuItem = menu.menuItems.find((menuItem) => menuItem.itemId === itemId);
		if (!menuItem) {
			throw new ApplicationError(ErrMessages.menu.MenuItemNotFound, StatusCodes.NOT_FOUND);
		}

		// Check if there are active orders for this menu item
		const hasActiveOrders = await this.orderService.hasActiveOrdersForMenuItem(menuId, itemId);
		if (hasActiveOrders) {
			throw new ApplicationError(ErrMessages.menu.MenuItemHasActiveOrders, StatusCodes.BAD_REQUEST);
		}

		// Remove the menu item
		await this.menuRepo.removeMenuItem(menuId, itemId);
	}

	async getMenuByIdWithItemDetailsOrFail(menuId: number) {
		const menu = await this.menuRepo.getMenuByIdWithItemDetails(menuId);

		if (!menu) {
			throw new ApplicationError(ErrMessages.menu.MenuNotFound, StatusCodes.NOT_FOUND);
		}

		return menu;
	}

	/**
	 * Gets a menu by its ID.
	 *
	 * @param menuId - The ID of the menu to get.
	 * @throws {ApplicationError} If the menu is not found.
	 * @returns The requested menu.
	 */
	async getMenuByIdWithItemDetails(menuId: number): Promise<Menu | null> {
		const menu = await this.menuRepo.getMenuByIdWithItemDetails(menuId);
		return menu;
	}

	async getMenuByIdAndRestaurantId(restaurantId: number, menuId: number) {
		const menu = await this.menuRepo.getMenuByIdAndRestaurantId(menuId, restaurantId);

		if (!menu) {
			throw new ApplicationError(ErrMessages.menu.MenuNotFound, StatusCodes.NOT_FOUND);
		}

		return menu;
	}

	async getRestaurantMenus(restaurantId: number): Promise<Menu[] | []> {
		const menus = await this.menuRepo.getAllRestaurantMenus(restaurantId);
		return menus;
	}

	@Transactional()
	async deleteRestaurantMenu(menuId: number, userId: number): Promise<void> {
		// Validate user owns the restaurant
		const restaurant = await this.restaurantService.validateUserOwnsActiveRestaurant(userId);

		// Validate menu belongs to restaurant
		const menu = await this.getMenuByIdAndRestaurantId(menuId, restaurant.restaurantId);

		const hasActiveOrders = await this.orderService.hasActiveOrdersForMenu(menu.menuId);
		if (hasActiveOrders) {
			throw new ApplicationError(ErrMessages.menu.MenuHasActiveOrders, StatusCodes.BAD_REQUEST);
		}

		await this.menuRepo.deleteMenu(menuId);
	}

	@Transactional()
	async setDefaultRestaurantMenu(menuId: number, userId: number): Promise<void> {
		// Validate user owns the restaurant
		const restaurant = await this.restaurantService.validateUserOwnsActiveRestaurant(userId);

		// Validate menu belongs to restaurant
		const menu = this.findRestaurantMenu(restaurant, menuId);

		await this.menuRepo.setDefaultMenu(restaurant.restaurantId, menu.menuId);
	}

	@Transactional()
	async updateRestaurantMenu(request: UpdateMenuRequestDTO) {
		// Validate user owns the restaurant
		const restaurant = await this.restaurantService.validateUserOwnsActiveRestaurant(request.userId);

		await this.validateUniqueMenuTitleAcrossRestaurant(restaurant.restaurantId, request.menuTitle);

		const updatedMenu = await this.menuRepo.updateMenu(request.menuId, { menuTitle: request.menuTitle });

		return this.buildMenuResponse(updatedMenu!);
	}

	async searchForMenuItems(restaurantId: number, menuId: number, query: string) {
		const items = await this.menuRepo.searchItems(restaurantId, menuId, query);
		return items;
	}

	// Helper Methods

	private async createMenu(restaurantId: number, request: CreateMenuRequestDTO) {
		const menuToCreate = Menu.buildMenu(restaurantId, request);
		const createdMenu = await this.menuRepo.createMenu(menuToCreate);
		return createdMenu;
	}

	private async createMenuItems(menuId: number, items: number[]) {
		const menuItems = MenuItem.buildMenuItems(menuId, items);
		const createdMenuItems = await this.menuRepo.createMenuItems(menuItems);
		return createdMenuItems;
	}

	/**
	 * Extracts item IDs from an array of items.
	 *
	 * @param items - The array of items from which to extract item IDs.
	 * @returns An array of item IDs.
	 */

	private extractItemIds(items: any[]): number[] {
		return items.map((item) => item.itemId);
	}

	private findRestaurantMenu(restaurant: Restaurant, menuId: number) {
		const menu = restaurant.menus.find((menu: Menu) => menu.menuId === menuId);
		if (!menu) {
			throw new ApplicationError(ErrMessages.menu.MenuNotFound, StatusCodes.NOT_FOUND);
		}
		return menu;
	}

	/**
	 * Filters out unavailable items and returns only the available ones.
	 *
	 * @param items - The item IDs to validate.
	 * @returns Array of available item IDs.
	 */
	private async filterUnavailableItems(items: number[]): Promise<number[]> {
		const availableItems = await this.menuRepo.getAvailableItemsByIds(items);
		const availableItemIds = this.extractItemIds(availableItems);

		// Return only the available items instead of throwing an error
		return items.filter((id) => availableItemIds.includes(id));
	}

	/**
	 * Validates that the items to be added to the menu are not already on the menu.
	 *
	 * @param menuItems - The menu items that are currently on the menu.
	 * @param itemIds - The item IDs to add to the menu.
	 *
	 * @throws {ApplicationError} If any of the new items already exist on the menu.
	 */
	private validateExistingMenuItems(menuItems: MenuItem[], itemIds: number[]) {
		const existingMenuItemIds = this.extractItemIds(menuItems);
		const newItemIdsExists = itemIds.filter((id) => existingMenuItemIds.includes(id));

		if (newItemIdsExists.length > 0) {
			throw new ApplicationError(
				`${ErrMessages.menu.MenuItemAlreadyExists}: ${newItemIdsExists.join(', ')}`,
				StatusCodes.BAD_REQUEST
			);
		}
	}

	private async validateMenuBelongsToRestaurant(menu: Menu, restaurantId: number) {
		if (menu.restaurantId !== restaurantId) {
			throw new ApplicationError(ErrMessages.menu.MenuNotBelongToRestaurant);
		}
	}

	/**
	 * Validates that a menu title is unique across a restaurant's menus.
	 *
	 * @param restaurantMenus - Array of existing menus for the restaurant.
	 * @param menuTitle - The title of the menu to check for uniqueness.
	 * @throws ApplicationError if a menu with the same title already exists.
	 */

	private async validateUniqueMenuTitleAcrossRestaurant(restaurantId: number, menuTitle: string) {
		const menu = await this.menuRepo.getMenuByRestaurantIdAndMenuTitle(restaurantId, menuTitle);
		if (menu) {
			throw new ApplicationError(ErrMessages.menu.MenuWithSameTitleExists, StatusCodes.BAD_REQUEST);
		}
	}

	/**
	 * Validates that the total number of menus for a restaurant does not exceed the allowed limit.
	 *
	 * @param restaurantMenus - Array of existing menus for the restaurant.
	 * @throws ApplicationError if the restaurant has reached the maximum allowed number of menus.
	 */
	private async validateMenuCountAcrossRestaurant(restaurantId: number) {
		const maxMenusPerRestaurant = await this.settingService.getMaxMenusPerRestaurant();
		const restaurantMenus = await this.menuRepo.getAllRestaurantMenus(restaurantId);
		if (restaurantMenus.length >= maxMenusPerRestaurant) {
			throw new ApplicationError(ErrMessages.menu.RestaurantMenuLimitReached, StatusCodes.BAD_REQUEST);
		}
	}

	private buildMenuResponse(menu: Menu): MenuResponseDTO {
		return {
			menuId: menu.menuId,
			restaurantId: menu.restaurantId,
			menuTitle: menu.menuTitle,
			isDefaultMenu: menu.isActive,
			createdAt: menu.createdAt.toISOString(),
			updatedAt: menu.updatedAt.toISOString()
		};
	}

	private buildMenuItemResponse(menuItems: MenuItem[]): MenuItemResponseDTO[] {
		return menuItems.map((menuItem) => ({
			menuId: menuItem.menuId,
			itemId: menuItem.itemId,
			menuItemId: menuItem.menuItemId
		}));
	}
}
