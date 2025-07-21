import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApplicationError, ErrMessages } from '../errors';
import { RestaurantRepository } from '../repositories';
import { Restaurant } from '../models';

export interface RestaurantOwnershipContext {
	restaurant: Restaurant;
	isOwner: boolean;
}

declare module 'express-serve-static-core' {
	interface Request {
		restaurantContext?: RestaurantOwnershipContext;
	}
}

const restaurantRepo = new RestaurantRepository();

export const isActiveRestaurantOwner = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			throw new ApplicationError(ErrMessages.http.Unauthorized, StatusCodes.UNAUTHORIZED);
		}

		const { userId, actorType } = req.user;

		if (actorType !== 'staff') {
			throw new ApplicationError(ErrMessages.restaurant.NotRestaurantUser, StatusCodes.FORBIDDEN);
		}

		const restaurant = await restaurantRepo.getActiveRestaurantByUserId(userId);

		if (!restaurant) {
			throw new ApplicationError(ErrMessages.restaurant.NoActiveRestaurant, StatusCodes.FORBIDDEN);
		}

		req.restaurantContext = {
			restaurant,
			isOwner: true
		};

		next();
	} catch (error) {
		next(error);
	}
};
