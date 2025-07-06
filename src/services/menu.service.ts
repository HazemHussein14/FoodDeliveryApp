import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { Transactional } from 'typeorm-transactional';
import { MenuRepository } from '../repositories';
import { Menu } from '../models';
import { CreateMenuRequestDTO, MenuResponseDTO } from '../dto/menu.dto';
import { RestaurantService } from './restaurant.service';

const MAX_MENUS_PER_RESTAURANT = 3;

export class MenuService {
	private readonly menuRepo = new MenuRepository();
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

	// Helper Methods

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
}
