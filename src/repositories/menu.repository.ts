import { AppDataSource } from '../config/data-source';
import { Menu, MenuItem, Item } from '../models';
import { In, Repository } from 'typeorm';

export class MenuRepository {
	private readonly menuRepo: Repository<Menu>;
	private readonly menuItemRepo: Repository<MenuItem>;
	private readonly itemRepo: Repository<Item>;

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

	async getMenuByIdAndRestaurantId(menuId: number, restaurantId: number): Promise<Menu | null> {
		return await this.menuRepo.findOne({
			where: {
				menuId: menuId,
				restaurantId: restaurantId
			}
		});
	}

	async getMenuByIdWithItemDetails(menuId: number): Promise<Menu | null> {
		return await this.menuRepo
			.createQueryBuilder('menu')
			.leftJoinAndSelect('menu.menuItems', 'menuItem')
			.leftJoinAndSelect('menuItem.item', 'item')
			.where('menu.menuId = :menuId', { menuId })
			.getOne();
	}

	async getMenuByRestaurantIdAndMenuTitle(restaurantId: number, menuTitle: string): Promise<Menu | null> {
		return await this.menuRepo.findOne({
			where: { menuTitle, restaurantId, isDeleted: false }
		});
	}

	async getMenuCountByRestaurantId(restaurantId: number): Promise<number> {
		return await this.menuRepo.count({
			where: { restaurantId, isDeleted: false }
		});
	}

	async getAllMenus(): Promise<Menu[]> {
		return await this.menuRepo.find({
			where: { isActive: true }
		});
	}

	async getAllRestaurantMenus(restaurantId: number): Promise<Menu[] | []> {
		return await this.menuRepo.find({
			where: {
				restaurantId,
				isDeleted: false
			}
		});
	}

	// async getRestaurantMenus(restaurantId: number): Promise<Menu[]> {
	// 	return await this.menuRepo
	// 		.createQueryBuilder('menu')
	// 		.leftJoinAndSelect('menu.menuItems', 'menuItem')
	// 		.leftJoinAndSelect('menuItem.item', 'item')
	// 		.where('menu.restaurantId = :restaurantId', { restaurantId })
	// 		.andWhere('menu.isDeleted = :isDeleted', { isDeleted: false })
	// 		.getMany();
	// }

	async updateMenu(menuId: number, data: Partial<Menu>): Promise<Menu | null> {
		await this.menuRepo.update(menuId, data);
		return await this.getMenuById(menuId);
	}

	async deleteMenu(menuId: number): Promise<void> {
		await this.menuRepo.update(menuId, { isDeleted: true, isActive: false });
	}

	async setDefaultMenu(restaurantId: number, menuId: number): Promise<void> {
		await this.menuRepo.update({ restaurantId }, { isActive: false });
		await this.menuRepo.update({ menuId }, { isActive: true });
	}

	async getMenuItemsByItemIds(menuId: number, itemIds: number[]): Promise<MenuItem[]> {
		return await this.menuItemRepo.find({
			where: {
				menuId,
				itemId: In(itemIds)
			}
		});
	}

	// Menu Item operations
	async addMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
		const menuItem = this.menuItemRepo.create(data);
		return await this.menuItemRepo.save(menuItem);
	}

	async createMenuItems(data: Partial<MenuItem>[]): Promise<MenuItem[]> {
		const menuItems = this.menuItemRepo.create(data);
		return await this.menuItemRepo.save(menuItems);
	}

	async getMenuItems(menuId: number): Promise<MenuItem[]> {
		return await this.menuItemRepo.find({
			where: { menuId },
			relations: ['item']
		});
	}

	async getMenuItemByItemAndRestaurant(itemId: number, restaurantId: number) {
		return await this.menuItemRepo
			.createQueryBuilder('mi')
			.innerJoin('mi.menu', 'm')
			.where('mi.itemId = :itemId', { itemId })
			.andWhere('m.restaurantId = :restaurantId', { restaurantId })
			.getOne();
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

	async getAvailableItemsByIds(itemIds: number[]): Promise<Item[]> {
		return await this.itemRepo.find({
			where: {
				itemId: In(itemIds),
				isAvailable: true
			}
		});
	}

	async getItemByRestaurant(restaurantId: number, itemId: number): Promise<Item | null> {
		const item = await this.itemRepo
			.createQueryBuilder('menuItem')
			.innerJoin('menuItem.menu', 'menu', 'menuItem.menuId = menu.menuId')
			.innerJoin('menu.restaurant', 'restaurant', 'menu.restaurantId = restaurant.restaurantId')
			.where('menuItem.itemId = :itemId', { itemId })
			.andWhere('menu.isActive = true')
			.andWhere('restaurant.restaurantId = :restaurantId', { restaurantId })
			.getOne();

		return item;
	}

	async updateItem(itemId: number, data: Partial<Item>): Promise<Item | null> {
		await this.itemRepo.update(itemId, data);
		return await this.getItemById(itemId);
	}

	async deleteItem(itemId: number): Promise<void> {
		await this.itemRepo.update(itemId, { isAvailable: false });
	}

	async searchItems(restaurantId: number, menuId: number, query: string): Promise<Item[]> {
		return await this.itemRepo
			.createQueryBuilder('item')
			.innerJoin('item.menuItems', 'menuItem')
			.innerJoin('menuItem.menu', 'menu')
			.where('menu.restaurantId = :restaurantId', { restaurantId })
			.andWhere('menu.menuId = :menuId', { menuId })
			.andWhere('item.name ILIKE :query', { query: `%${query}%` })
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
