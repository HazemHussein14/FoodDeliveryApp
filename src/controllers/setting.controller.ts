import { Request, Response } from 'express';
import { SettingService } from '../services';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { TYPES } from '../config/types';

@injectable()
export class SettingController {
	constructor(@inject(TYPES.SettingService) private readonly settingService: SettingService) {}

	/**
	 * Gets all settings.
	 */
	async getAllSettings(req: Request, res: Response) {
		const settings = await this.settingService.getAllSettings();
		return sendResponse(res, StatusCodes.OK, 'Settings retrieved successfully', settings);
	}

	/**
	 * Gets a setting by its key.
	 */
	async getSettingByKey(req: Request, res: Response) {
		const { key } = req.params;
		const value = await this.settingService.getSettingValue(key as any); // ideally cast to SettingKey enum

		if (value === null) {
			return sendResponse(res, StatusCodes.NOT_FOUND, 'Setting not found', null);
		}

		return sendResponse(res, StatusCodes.OK, 'Setting retrieved successfully', { key, value });
	}

	/**
	 * Creates or updates a setting.
	 */
	async upsertSetting(req: Request, res: Response) {
		const { key, value } = req.body;

		if (!key || value === undefined) {
			return sendResponse(res, StatusCodes.BAD_REQUEST, 'Key and value are required', null);
		}

		const setting = await this.settingService.set(key as any, value); // cast to SettingKey if enum
		return sendResponse(res, StatusCodes.OK, 'Setting updated successfully', setting);
	}

	/**
	 * Deletes a setting by its key.
	 */
	async deleteSetting(req: Request, res: Response) {
		const { key } = req.params;
		await this.settingService.delete(key as any); // cast to SettingKey

		return sendResponse(res, StatusCodes.OK, 'Setting deleted successfully', null);
	}

	async getMaxMenusPerRestaurant(req: Request, res: Response) {
		const maxMenus = await this.settingService.getMaxMenusPerRestaurant();
		return sendResponse(res, StatusCodes.OK, 'Max menus per restaurant retrieved successfully', {
			maxMenusPerRestaurant: maxMenus
		});
	}
}
