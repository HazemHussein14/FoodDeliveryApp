import { StatusCodes } from 'http-status-codes';
import { ApplicationError, ErrMessages } from '../errors';
import { RestaurantRepository } from '../repositories';
import { Restaurant } from '../models';

export class RestaurantService {
	private readonly restaurantRepo = new RestaurantRepository();

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

	async getRestaurantByUserIdAndRestaurantId(userId: number) {
		const restaurant = await this.restaurantRepo.getRestaurantByUserId(userId);

		if (!restaurant) {
			throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.NOT_FOUND);
		}
		return restaurant;
	}

	async validateUserOwnsActiveRestaurant(userId: number) {
		const restaurant = await this.getRestaurantByUserId(userId);
		this.validateUserIsOwner(restaurant, userId);
		this.validateRestaurantIsActive(restaurant);
		return restaurant;
	}

	validateUserIsOwner(restaurant: Restaurant, userId: number) {
		if (restaurant.userId !== userId) {
			throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.FORBIDDEN);
		}
	}

	async validateRestaurantIsOpen(restaurantId: number) {
		const restaurant = await this.getRestaurantById(restaurantId);

		if (restaurant.status !== 'open') {
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNotOpen, StatusCodes.BAD_REQUEST);
		}
	}
	async validateRestaurantIsActive(restaurant: Restaurant) {
		if (!restaurant.isActive) {
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNotAvailable, StatusCodes.BAD_REQUEST);
		}
	}
}
