import { StatusCodes } from 'http-status-codes';
import { ApplicationError, ErrMessages } from '../errors';
import { RestaurantRepository } from '../repositories';

export class RestaurantService {
	private restaurantRepo = new RestaurantRepository();

	async getRestaurantByUserId(userId: number) {
		const restaurant = await this.restaurantRepo.getRestaurantByUserId(userId);
		if (!restaurant) {
			throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.NOT_FOUND);
		}
		return restaurant;
	}

	async getRestaurantById(restaurantId: number) {
		const restaurant = await this.restaurantRepo.getRestaurantById(restaurantId);

		if (!restaurant) {
			throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.NOT_FOUND);
		}
		return restaurant;
	}

	async validateRestaurantIsOpen(restaurantId: number) {
		const restaurant = await this.getRestaurantById(restaurantId);

		if (restaurant.status !== 'open') {
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNotOpen, StatusCodes.BAD_REQUEST);
		}
	}
	async validateRestaurantIsActive(restaurantId: number) {
		const restaurant = await this.getRestaurantById(restaurantId);

		if (!restaurant.isActive) {
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNotAvailable, StatusCodes.BAD_REQUEST);
		}
	}
}
