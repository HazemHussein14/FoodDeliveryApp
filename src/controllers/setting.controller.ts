import { Request, Response } from 'express';
import { SettingService } from '../services';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

export class SettingController {
	private readonly settingService = new SettingService();

	/**
	 * Gets all settings.
	 *
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	async getAllSettings(req: Request, res: Response) {
		const settings = await this.settingService.getAllSettings();
		return sendResponse(res, StatusCodes.OK, 'Settings retrieved successfully', settings);
	}

	/**
	 * Gets a setting by its key.
	 *
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	async getSettingByKey(req: Request, res: Response) {
		const { key } = req.params;
		const value = await this.settingService.getSettingValue(key);

		if (value === null) {
			return sendResponse(res, StatusCodes.NOT_FOUND, 'Setting not found', null);
		}

		return sendResponse(res, StatusCodes.OK, 'Setting retrieved successfully', { key, value });
	}

	/**
	 * Creates or updates a setting.
	 *
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	async upsertSetting(req: Request, res: Response) {
		const { key, value } = req.body;

		if (!key || value === undefined) {
			return sendResponse(res, StatusCodes.BAD_REQUEST, 'Key and value are required', null);
		}

		const setting = await this.settingService.upsertSetting(key, value);
		return sendResponse(res, StatusCodes.OK, 'Setting updated successfully', setting);
	}

	/**
	 * Deletes a setting by its key.
	 *
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	async deleteSetting(req: Request, res: Response) {
		const { key } = req.params;
		const deleted = await this.settingService.deleteSetting(key);

		if (!deleted) {
			return sendResponse(res, StatusCodes.NOT_FOUND, 'Setting not found', null);
		}

		return sendResponse(res, StatusCodes.OK, 'Setting deleted successfully', null);
	}

	/**
	 * Gets the maximum number of menus per restaurant setting.
	 *
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	async getMaxMenusPerRestaurant(req: Request, res: Response) {
		const maxMenus = await this.settingService.getMaxMenusPerRestaurant();
		return sendResponse(res, StatusCodes.OK, 'Max menus per restaurant retrieved successfully', {
			maxMenusPerRestaurant: maxMenus
		});
	}
}
