import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AddItemsToMenuRequestDTO, CreateMenuRequestDTO } from '../dto/menu.dto';
import { MenuService } from '../services';

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

	async getRestaurantMenu(req: Request, res: Response) {
		sendResponse(res, StatusCodes.OK, 'Menu fetched successfully');
	}

	async searchForMenuItems(req: Request, res: Response) {
		sendResponse(res, StatusCodes.OK, 'Menu items fetched successfully');
	}

	async updateRestaurantMenu(req: Request, res: Response) {
		sendResponse(res, StatusCodes.OK, 'Menu updated successfully');
	}

	async deleteRestaurantMenu(req: Request, res: Response) {
		sendResponse(res, StatusCodes.OK, 'Menu deleted successfully');
	}

	async setDefaultRestaurantMenu(req: Request, res: Response) {
		sendResponse(res, StatusCodes.OK, 'Default menu set successfully');
	}

	async getRestaurantMenuHistory(req: Request, res: Response) {
		sendResponse(res, StatusCodes.OK, 'Menu history fetched successfully');
	}
}
