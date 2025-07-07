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

export class MenuController {
	private readonly menuService = new MenuService();
	async createRestaurantMenu(req: Request, res: Response) {
		const createMenuRequest: CreateMenuRequestDTO = req.validated?.body;
		const restaurantId = req.validated?.params.restaurantId;
		const menu = await this.menuService.createRestaurantMenu(restaurantId, createMenuRequest);
		sendResponse(res, StatusCodes.CREATED, 'Menu created successfully', menu);
	}

	async addItemsToRestaurantMenu(req: Request, res: Response) {
		const { restaurantId, menuId } = req.validated?.params;
		const { items, userId } = req.validated?.body;

		const request: AddItemsToMenuRequestDTO = {
			restaurantId,
			menuId,
			items,
			userId
		};

		const menuItems = await this.menuService.addItemsToRestaurantMenu(request);
		sendResponse(res, StatusCodes.CREATED, 'Menu items added successfully', menuItems);
	}

	async removeItemFromRestaurantMenu(req: Request, res: Response) {
		const { restaurantId, menuId, itemId } = req.validated?.params;
		const { userId } = req.validated?.body;

		const request: RemoveMenuItemRequestDTO = {
			restaurantId,
			menuId,
			itemId,
			userId
		};

		await this.menuService.removeItemFromRestaurantMenu(request);
		sendResponse(res, StatusCodes.OK, 'Menu item removed successfully');
	}

	async getRestaurantMenuById(req: Request, res: Response) {
		const { menuId } = req.validated?.params;
		const menu = await this.menuService.getRestaurantMenuById(menuId);
		sendResponse(res, StatusCodes.OK, 'Menu fetched successfully', menu);
	}

	async getRestaurantMenus(req: Request, res: Response) {
		const { restaurantId } = req.validated?.params;
		const menus = await this.menuService.getRestaurantMenus(restaurantId);
		sendResponse(res, StatusCodes.OK, 'Menus fetched successfully', menus);
	}

	async searchForMenuItems(req: Request, res: Response) {
		logger.info(`searching for menu items`);
		const { restaurantId, menuId } = req.validated?.params;
		const { query } = req.validated?.query;
		logger.info(`query ${query}`);
		const menuItems = await this.menuService.searchForMenuItems(restaurantId, menuId, query);
		sendResponse(res, StatusCodes.OK, 'Menu items fetched successfully', menuItems);
	}

	async updateRestaurantMenu(req: Request, res: Response) {
		const { restaurantId, menuId } = req.validated?.params;
		const updateMenuRequest: UpdateMenuRequestDTO = {
			...req.validated?.body,
			menuId
		};
		const menu = await this.menuService.updateRestaurantMenu(restaurantId, updateMenuRequest);
		sendResponse(res, StatusCodes.OK, 'Menu updated successfully', menu);
	}

	async deleteRestaurantMenu(req: Request, res: Response) {
		const { restaurantId, menuId } = req.validated?.params;
		const { userId } = req.validated?.body;
		await this.menuService.deleteRestaurantMenu(restaurantId, menuId, userId);
		sendResponse(res, StatusCodes.NO_CONTENT, 'Menu deleted successfully');
	}

	async setDefaultRestaurantMenu(req: Request, res: Response) {
		const { restaurantId, menuId } = req.validated?.params;
		const { userId } = req.validated?.body;
		await this.menuService.setDefaultRestaurantMenu(restaurantId, menuId, userId);
		sendResponse(res, StatusCodes.OK, 'Default menu set successfully');
	}

	async getRestaurantMenuHistory(req: Request, res: Response) {
		sendResponse(res, StatusCodes.OK, 'Menu history fetched successfully');
	}
}
