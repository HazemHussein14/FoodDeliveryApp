import { injectable } from 'inversify';
import { AppDataSource } from '../config/data-source';
import { Setting } from '../models/setting/setting.entity';
import { Repository } from 'typeorm';

@injectable()
export class SettingRepository {
	private readonly settingRepo: Repository<Setting>;
	// private readonly settingRepo: Repository<Setting>;

	constructor() {
		this.settingRepo = AppDataSource.getRepository(Setting);
	}

	async getAllSettings(): Promise<Setting | null> {
		return await this.settingRepo.findOne({
			where: {
				settingId: 1
			}
		});
	}

	async findByKey(key: string): Promise<any> {
		return await this.settingRepo.findOne({ where: { key } });
	}

	async upsertByKey(key: string, value: any, description?: string): Promise<Setting> {
		let setting = await this.findByKey(key);

		if (!setting) {
			setting = this.settingRepo.create({ key, value });
		} else {
			setting.value = value;
		}

		if (description) setting.description = description;

		return await this.settingRepo.save(setting);
	}

	async findAll(): Promise<Setting[]> {
		return await this.settingRepo.find();
	}

	async delete(key: string): Promise<void> {
		await this.settingRepo.delete({ key });
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
}
