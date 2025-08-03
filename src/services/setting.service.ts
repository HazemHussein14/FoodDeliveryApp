import { inject, injectable } from 'inversify';
import { TYPES } from '../config/types';
import { SettingRepository } from '../repositories';
import { Setting } from '../models';
import { SettingKey } from '../enums/setting.enum';
import { redisService } from '../shared/redis';

@injectable()
export class SettingService {
	private static readonly REDIS_PREFIX = 'setting';

	constructor(
		@inject(TYPES.SettingRepository)
		private readonly settingRepo: SettingRepository
	) {}

	async getAllSettings(): Promise<Setting | null> {
		return await this.settingRepo.getAllSettings();
	}

	/**
	 * Gets a setting value by its key.
	 */
	async getSettingValue(key: string): Promise<any> {
		return await this.settingRepo.getSettingValue(key);
	}

	/**
	 * Sets a setting value and updates cache.
	 */
	async set(key: SettingKey, value: any, description?: string): Promise<Setting> {
		const sanitizedKey = SettingService.sanitizeKey(key);
		const updated = await this.settingRepo.upsertByKey(sanitizedKey, value, description);
		const cachedKey = redisService.generateKey(SettingService.REDIS_PREFIX, sanitizedKey);
		await redisService.set(cachedKey, updated.value);
		return updated;
	}

	/**
	 * Deletes a setting and clears cache.
	 */
	async delete(key: SettingKey): Promise<void> {
		const sanitizedKey = SettingService.sanitizeKey(key);
		await this.settingRepo.delete(sanitizedKey);
		const cachedKey = redisService.generateKey(SettingService.REDIS_PREFIX, sanitizedKey);
		await redisService.del(cachedKey);
	}

	/**
	 * Clears the settings cache.
	 */
	async clearCache(): Promise<void> {
		await redisService.del(SettingService.REDIS_PREFIX);
	}

	/**
	 * Gets a numeric setting value with a fallback default.
	 */
	async getNumericSettingValue(key: string, defaultValue: number): Promise<number> {
		const value = await this.getSettingValue(key).catch(() => null);
		if (value === null || value === undefined) return defaultValue;

		const numeric = Number(value);
		return isNaN(numeric) ? defaultValue : numeric;
	}

	/**
	 * Convenience method for max menus per restaurant setting.
	 */
	async getMaxMenusPerRestaurant(): Promise<number> {
		return this.getNumericSettingValue('MAX_MENUS_PER_RESTAURANT', 3);
	}

	private static sanitizeKey(key: SettingKey): string {
		return key.trim().toUpperCase();
	}
}
