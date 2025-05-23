import { AppDataSource } from '../config/data-source';
import { Menu, MenuItem, Item } from '../models';
import { Repository } from 'typeorm';

export class MenuRepository {
	private menuRepo: Repository<Menu>;
	private menuItemRepo: Repository<MenuItem>;
	private itemRepo: Repository<Item>;

	constructor() {
		this.menuRepo = AppDataSource.getRepository(Menu);
		this.menuItemRepo = AppDataSource.getRepository(MenuItem);
		this.itemRepo = AppDataSource.getRepository(Item);
	}

	// Menu operations
	async createMenu(data: Partial<Menu>): Promise<Menu> {
		const menu = this.menuRepo.create(data);
		return await this.menuRepo.save(menu);
	}

	async getMenuById(menuId: number): Promise<Menu | null> {
		return await this.menuRepo.findOne({
			where: { menuId }
		});
	}

	async getAllMenus(): Promise<Menu[]> {
		return await this.menuRepo.find({
			where: { isActive: true }
		});
	}

	async updateMenu(menuId: number, data: Partial<Menu>): Promise<Menu | null> {
		await this.menuRepo.update(menuId, data);
		return await this.getMenuById(menuId);
	}

	async deleteMenu(menuId: number): Promise<void> {
		await this.menuRepo.update(menuId, { isActive: false });
	}

	// Menu Item operations
	async addMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
		const menuItem = this.menuItemRepo.create(data);
		return await this.menuItemRepo.save(menuItem);
	}

	async getMenuItems(menuId: number): Promise<MenuItem[]> {
		return await this.menuItemRepo.find({
			where: { menuId },
			relations: ['item']
		});
	}

	async removeMenuItem(menuId: number, itemId: number): Promise<void> {
		await this.menuItemRepo.delete({ menuId, itemId });
	}

	// Item operations
	async createItem(data: Partial<Item>): Promise<Item> {
		const item = this.itemRepo.create(data);
		return await this.itemRepo.save(item);
	}

	async getItemById(itemId: number): Promise<Item | null> {
		return await this.itemRepo.findOne({
			where: { itemId }
		});
	}

	async updateItem(itemId: number, data: Partial<Item>): Promise<Item | null> {
		await this.itemRepo.update(itemId, data);
		return await this.getItemById(itemId);
	}

	async deleteItem(itemId: number): Promise<void> {
		await this.itemRepo.update(itemId, { isAvailable: false });
	}

	async searchItems(query: string): Promise<Item[]> {
		return await this.itemRepo
			.createQueryBuilder('item')
			.where('item.name ILIKE :query', { query: `%${query}%` })
			.andWhere('item.isAvailable = :isAvailable', { isAvailable: true })
			.getMany();
	}

	async getAvailableItems(): Promise<Item[]> {
		return await this.itemRepo.find({
			where: { isAvailable: true }
		});
	}

	// Helper methods
	async getItemsByMenu(menuId: number): Promise<Item[]> {
		const menuItems = await this.menuItemRepo.find({
			where: { menuId },
			relations: ['item']
		});
		return menuItems.map((mi) => mi.item);
	}
}
