import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { Transactional } from 'typeorm-transactional';
import { MenuRepository } from '../repositories';
import { Menu, MenuItem } from '../models';
import { AddItemsToMenuRequestDTO, CreateMenuRequestDTO, MenuItemResponseDTO, MenuResponseDTO } from '../dto/menu.dto';
import { RestaurantService } from './restaurant.service';
import { OrderService } from './order.service';

const MAX_MENUS_PER_RESTAURANT = 3;

export class MenuService {
	private readonly menuRepo = new MenuRepository();
	private readonly orderService = new OrderService();
	private readonly restaurantService = new RestaurantService();
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
	async createRestaurantMenu(restaurantId: number, request: CreateMenuRequestDTO) {
		const restaurant = await this.restaurantService.getRestaurantById(restaurantId);

		this.restaurantService.validateRestaurantIsActive(restaurant);
		this.restaurantService.validateUserIsOwner(restaurant, request.userId);

		const restaurantMenus = restaurant.menus.filter((menu) => !menu.isDeleted);

		this.validateMenuCountAcrossRestaurant(restaurantMenus);
		this.validateUniqueMenuTitleAcrossRestaurant(restaurantMenus, request.menuTitle);

		const menuToCreate = Menu.buildMenu(restaurantId, request);
		const savedMenu = await this.menuRepo.createMenu(menuToCreate);

		return this.buildMenuResponse(savedMenu);
	}

	@Transactional()
	async addItemsToRestaurantMenu(request: AddItemsToMenuRequestDTO) {
		const { menuId, items, restaurantId, userId } = request;

		const restaurant = await this.restaurantService.getRestaurantById(restaurantId);
		this.restaurantService.validateUserIsOwner(restaurant, userId);

		const menu = await this.getRestaurantMenuById(menuId);
		this.validateMenuBelongsToRestaurant(menu, restaurantId);

		const itemIds = this.extractItemIds(items);
		this.validateExistingMenuItems(menu.menuItems, itemIds);
		this.validateItemsAreAvailable(itemIds);

		const menuItems = MenuItem.buildMenuItems(menuId, items);
		await this.menuRepo.createMenuItems(menuItems);
		const updatedMenuItems = await this.menuRepo.getMenuItems(menuId);
		return this.buildMenuItemResponse(updatedMenuItems);
	}

	/**
	 * Gets a menu by its ID.
	 *
	 * @param menuId - The ID of the menu to get.
	 * @throws {ApplicationError} If the menu is not found.
	 * @returns The requested menu.
	 */
	async getRestaurantMenuById(menuId: number): Promise<Menu> {
		const menu = await this.menuRepo.getMenuWithItemsDetails(menuId);
		if (!menu) {
			throw new ApplicationError(ErrMessages.menu.MenuNotFound, StatusCodes.NOT_FOUND);
		}
		return menu;
	}

	async getRestaurantMenus(restaurantId: number): Promise<MenuResponseDTO[]> {
		const menus = await this.menuRepo.getRestaurantMenus(restaurantId);
		return menus.map((menu) => this.buildMenuResponse(menu));
	}

	@Transactional()
	async deleteRestaurantMenu(restaurantId: number, menuId: number, userId: number): Promise<void> {
		const restaurant = await this.restaurantService.getRestaurantById(restaurantId);
		this.restaurantService.validateUserIsOwner(restaurant, userId);

		const menu = await this.getRestaurantMenuById(menuId);
		this.validateMenuBelongsToRestaurant(menu, restaurantId);

		this.validateMenuBelongsToRestaurant(menu, restaurantId);

		const hasActiveOrders = await this.orderService.hasActiveOrdersForMenu(menuId);
		if (hasActiveOrders) {
			throw new ApplicationError(ErrMessages.menu.MenuHasActiveOrders, StatusCodes.BAD_REQUEST);
		}

		await this.menuRepo.deleteMenu(menuId);
	}

	// Helper Methods

	/**
	 * Extracts item IDs from an array of items.
	 *
	 * @param items - The array of items from which to extract item IDs.
	 * @returns An array of item IDs.
	 */

	private extractItemIds(items: any[]): number[] {
		return items.map((item) => item.itemId);
	}

	/**
	 * Validates that a menu belongs to a given restaurant.
	 *
	 * @param menu - The menu to check.
	 * @param restaurantId - The ID of the restaurant to check against.
	 * @throws ApplicationError if the menu does not belong to the restaurant.
	 */
	private validateMenuBelongsToRestaurant(menu: Menu, restaurantId: number) {
		if (menu.restaurantId !== restaurantId) {
			throw new ApplicationError(ErrMessages.menu.MenuNotBelongToRestaurant, StatusCodes.BAD_REQUEST);
		}
	}

	/**
	 * Validates that all the item IDs passed in are available for the restaurant.
	 *
	 * @param itemIds - The item IDs to validate.
	 *
	 * @throws {ApplicationError} If any of the items are not available.
	 */
	private async validateItemsAreAvailable(itemIds: number[]) {
		const availableItems = await this.menuRepo.getAvailableItemsByIds(itemIds);
		const availableItemIds = this.extractItemIds(availableItems);

		const unavailableItemIds = itemIds.filter((id) => !availableItemIds.includes(id));

		if (unavailableItemIds.length > 0) {
			throw new ApplicationError(
				`${ErrMessages.item.ItemNotAvailable}: ${unavailableItemIds.join(', ')}`,
				StatusCodes.BAD_REQUEST
			);
		}
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

	/**
	 * Validates that a menu title is unique across a restaurant's menus.
	 *
	 * @param restaurantMenus - Array of existing menus for the restaurant.
	 * @param menuTitle - The title of the menu to check for uniqueness.
	 * @throws ApplicationError if a menu with the same title already exists.
	 */

	private validateUniqueMenuTitleAcrossRestaurant(restaurantMenus: Menu[], menuTitle: string) {
		const menuTitleExists = restaurantMenus.some((menu) => menu.menuTitle === menuTitle);
		if (menuTitleExists) {
			throw new ApplicationError(ErrMessages.menu.MenuWithSameTitleExists, StatusCodes.BAD_REQUEST);
		}
	}

	/**
	 * Validates that the total number of menus for a restaurant does not exceed the allowed limit.
	 *
	 * @param restaurantMenus - Array of existing menus for the restaurant.
	 * @throws ApplicationError if the restaurant has reached the maximum allowed number of menus.
	 */
	private validateMenuCountAcrossRestaurant(restaurantMenus: Menu[]) {
		if (restaurantMenus.length >= MAX_MENUS_PER_RESTAURANT) {
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
			menuItemId: menuItem.menuItemId,
			name: menuItem.item.name,
			description: menuItem.item.description,
			price: menuItem.item.price,
			imagePath: menuItem.item.imagePath,
			energyValCal: menuItem.item.energyValCal,
			isAvailable: menuItem.item.isAvailable
		}));
	}
}
