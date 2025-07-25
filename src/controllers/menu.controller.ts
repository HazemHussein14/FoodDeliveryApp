import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import {
	AddItemsToMenuRequestDTO,
	CreateMenuRequestDTO,
	RemoveMenuItemRequestDTO,
	UpdateMenuRequestDTO
} from '../dto/menu.dto';
import { MenuService } from '../services';
import logger from '../config/logger';
import { AuthorizedUser } from '../middlewares';

export class MenuController {
	private readonly menuService = new MenuService();
	async createMenu(req: Request, res: Response) {
		const { actorId: restaurantId } = req.user as AuthorizedUser;
		const createMenuRequest: CreateMenuRequestDTO = {
			restaurantId: restaurantId,
			menuTitle: req.validated?.body.menuTitle
		};
		const menu = await this.menuService.createMenu(createMenuRequest);
		sendResponse(res, StatusCodes.CREATED, 'Menu created successfully', menu);
	}

	async addItemsToMenu(req: Request, res: Response) {
		const { menuId } = req.validated?.params;
		const { items } = req.validated?.body;
		const request: AddItemsToMenuRequestDTO = {
			menuId,
			items
		};

		const menuItems = await this.menuService.addItemsToMenu(request);
		sendResponse(res, StatusCodes.CREATED, 'Menu items added successfully', menuItems);
	}

	async removeItemFromMenu(req: Request, res: Response) {
		const { menuId, itemId } = req.validated?.params;
		const { actorId: restaurantId } = req.user as AuthorizedUser;

		const request: RemoveMenuItemRequestDTO = {
			menuId,
			itemId,
			restaurantId
		};

		await this.menuService.removeItemFromMenu(request);
		sendResponse(res, StatusCodes.OK, 'Menu item removed successfully');
	}

	async getMenuByIdWithItemDetails(req: Request, res: Response) {
		const { menuId } = req.validated?.params;
		const menu = await this.menuService.getMenuByIdWithItemDetails(menuId);
		sendResponse(res, StatusCodes.OK, 'Menu fetched successfully', menu);
	}

	async getRestaurantMenus(req: Request, res: Response) {
		const { actorId: restaurantId } = req.user as AuthorizedUser;
		const menus = await this.menuService.getRestaurantMenus(restaurantId);
		sendResponse(res, StatusCodes.OK, 'Menus fetched successfully', menus);
	}

	async searchForMenuItems(req: Request, res: Response) {
		logger.info(`searching for menu items`);
		const { menuId } = req.validated?.params;
		const { query } = req.validated?.query;
		const menuItems = await this.menuService.searchForMenuItems(menuId, query);
		sendResponse(res, StatusCodes.OK, 'Menu items fetched successfully', menuItems);
	}

	async updateRestaurantMenu(req: Request, res: Response) {
		const { menuId } = req.validated?.params;
		const { menuTitle } = req.validated?.body;
		const { actorId: restaurantId } = req.user as AuthorizedUser;
		const updateMenuRequest: UpdateMenuRequestDTO = {
			restaurantId,
			menuTitle,
			menuId
		};
		const menu = await this.menuService.updateRestaurantMenu(updateMenuRequest);
		sendResponse(res, StatusCodes.OK, 'Menu updated successfully', menu);
	}

	async deleteRestaurantMenu(req: Request, res: Response) {
		const { menuId } = req.validated?.params;
		const { actorId: restaurantId } = req.user as AuthorizedUser;
		await this.menuService.deleteRestaurantMenu(menuId, restaurantId);
		sendResponse(res, StatusCodes.NO_CONTENT, 'Menu deleted successfully');
	}

	async setDefaultRestaurantMenu(req: Request, res: Response) {
		const { menuId } = req.validated?.params;
		const { actorId: restaurantId } = req.user as AuthorizedUser;
		await this.menuService.setDefaultRestaurantMenu(menuId, restaurantId);
		sendResponse(res, StatusCodes.OK, 'Default menu set successfully');
	}
}
