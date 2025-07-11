import { AppDataSource } from '../config/data-source';
import { Setting } from '../models';
import { Repository } from 'typeorm';

export class SettingRepository {
	private readonly settingRepo: Repository<Setting>;

	constructor() {
		this.settingRepo = AppDataSource.getRepository(Setting);
	}

	/**
	 * Gets a setting by its key.
	 *
	 * @param key - The key of the setting to retrieve.
	 * @returns The setting if found, null otherwise.
	 */
	async getSettingByKey(key: string): Promise<Setting | null> {
		return await this.settingRepo.findOne({ where: { key } });
	}

	/**
	 * Gets a setting value by its key.
	 *
	 * @param key - The key of the setting to retrieve.
	 * @returns The setting value if found, null otherwise.
	 */
	async getSettingValue(key: string): Promise<any> {
		const setting = await this.getSettingByKey(key);
		return setting ? setting.value : null;
	}

	/**
	 * Creates or updates a setting.
	 *
	 * @param key - The key of the setting.
	 * @param value - The value of the setting.
	 * @returns The created or updated setting.
	 */
	async upsertSetting(key: string, value: any): Promise<Setting> {
		const existingSetting = await this.getSettingByKey(key);

		if (existingSetting) {
			existingSetting.value = value;
			return await this.settingRepo.save(existingSetting);
		} else {
			const newSetting = this.settingRepo.create({ key, value });
			return await this.settingRepo.save(newSetting);
		}
	}

	/**
	 * Gets all settings.
	 *
	 * @returns Array of all settings.
	 */
	async getAllSettings(): Promise<Setting[]> {
		return await this.settingRepo.find();
	}

	/**
	 * Deletes a setting by its key.
	 *
	 * @param key - The key of the setting to delete.
	 * @returns True if deleted, false if not found.
	 */
	async deleteSetting(key: string): Promise<boolean> {
		const result = await this.settingRepo.delete({ key });
		return result.affected ? result.affected > 0 : false;
	}
}
