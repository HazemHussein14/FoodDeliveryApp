import { AppDataSource } from '../config/data-source';
import { Restaurant } from '../models';
import { Repository } from 'typeorm';

export class RestaurantRepository {
	private readonly restaurantRepo: Repository<Restaurant>;

	constructor() {
		this.restaurantRepo = AppDataSource.getRepository(Restaurant);
	}

	async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
		const restaurant = this.restaurantRepo.create(data);
		return await this.restaurantRepo.save(restaurant);
	}

	// async getRestaurantById(restaurantId: number): Promise<Restaurant | null> {
	// 	return await this.restaurantRepo
	// 		.createQueryBuilder('restaurant')
	// 		.leftJoinAndSelect('restaurant.restaurantSetting', 'restaurantSetting')
	// 		.leftJoinAndSelect('restaurant.menus', 'menus')
	// 		.where('restaurant.restaurant_id = :restaurantId', { restaurantId })
	// 		.getOne();
	// }

	async getRestaurantByUserId(userId: number): Promise<Restaurant | null> {
		return await this.restaurantRepo.findOne({
			where: { userId },
			relations: ['restaurantSetting']
		});
	}

	async getRestaurantById(restaurantId: number): Promise<Restaurant | null> {
		return await this.restaurantRepo.findOne({
			where: {
				restaurantId
			}
		});
	}

	async getAllRestaurants(): Promise<Restaurant[]> {
		return await this.restaurantRepo.find({
			relations: ['restaurantSetting'],
			where: { isActive: true }
		});
	}

	async updateRestaurant(restaurantId: number, data: Partial<Restaurant>): Promise<Restaurant | null> {
		await this.restaurantRepo.update(restaurantId, data);
		return await this.getRestaurantById(restaurantId);
	}

	async updateRestaurantStatus(
		restaurantId: number,
		status: 'open' | 'busy' | 'pause' | 'closed'
	): Promise<Restaurant | null> {
		await this.restaurantRepo.update(restaurantId, { status });
		return await this.getRestaurantById(restaurantId);
	}

	async deleteRestaurant(restaurantId: number): Promise<void> {
		await this.restaurantRepo.update(restaurantId, { isActive: false });
	}

	async searchRestaurants(query: string): Promise<Restaurant[]> {
		return await this.restaurantRepo
			.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.user', 'user')
			.where('restaurant.name ILIKE :query', { query: `%${query}%` })
			.andWhere('restaurant.isActive = :isActive', { isActive: true })
			.getMany();
	}

	async getRestaurantsByStatus(status: 'open' | 'busy' | 'pause' | 'closed'): Promise<Restaurant[]> {
		return await this.restaurantRepo.find({
			where: { status, isActive: true }
		});
	}
}
