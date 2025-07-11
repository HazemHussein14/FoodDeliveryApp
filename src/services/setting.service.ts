import { SettingRepository } from '../repositories';
import { Setting } from '../models';
import { ApplicationError, ErrMessages } from '../errors';
import { StatusCodes } from 'http-status-codes';

export class SettingService {
	private readonly settingRepo = new SettingRepository();

	/**
	 * Gets a setting value by its key.
	 *
	 * @param key - The key of the setting to retrieve.
	 * @returns The setting value if found, null otherwise.
	 */
	async getSettingValue(key: string): Promise<any> {
		return await this.settingRepo.getSettingValue(key);
	}

	/**
	 * Gets a setting value by its key with a default fallback.
	 *
	 * @param key - The key of the setting to retrieve.
	 * @param defaultValue - The default value to return if setting is not found.
	 * @returns The setting value if found, default value otherwise.
	 */
	async getSettingValueWithDefault(key: string, defaultValue: any): Promise<any> {
		const value = await this.settingRepo.getSettingValue(key);
		return value !== null ? value : defaultValue;
	}

	/**
	 * Gets a numeric setting value with a default fallback.
	 *
	 * @param key - The key of the setting to retrieve.
	 * @param defaultValue - The default value to return if setting is not found.
	 * @returns The numeric setting value if found, default value otherwise.
	 */
	async getNumericSettingValue(key: string, defaultValue: number): Promise<number> {
		const value = await this.settingRepo.getSettingValue(key);
		if (value === null || value === undefined) {
			return defaultValue;
		}

		const numericValue = Number(value);
		if (isNaN(numericValue)) {
			return defaultValue;
		}

		return numericValue;
	}

	/**
	 * Creates or updates a setting.
	 *
	 * @param key - The key of the setting.
	 * @param value - The value of the setting.
	 * @returns The created or updated setting.
	 */
	async upsertSetting(key: string, value: any): Promise<Setting> {
		return await this.settingRepo.upsertSetting(key, value);
	}

	/**
	 * Gets all settings.
	 *
	 * @returns Array of all settings.
	 */
	async getAllSettings(): Promise<Setting[]> {
		return await this.settingRepo.getAllSettings();
	}

	/**
	 * Deletes a setting by its key.
	 *
	 * @param key - The key of the setting to delete.
	 * @returns True if deleted, false if not found.
	 */
	async deleteSetting(key: string): Promise<boolean> {
		return await this.settingRepo.deleteSetting(key);
	}

	/**
	 * Gets the maximum number of menus allowed per restaurant.
	 *
	 * @returns The maximum number of menus per restaurant.
	 */
	async getMaxMenusPerRestaurant(): Promise<number> {
		return await this.getNumericSettingValue('max_menus_per_restaurant', 3);
	}
}
