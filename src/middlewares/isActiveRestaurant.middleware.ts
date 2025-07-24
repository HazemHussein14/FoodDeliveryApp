import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApplicationError, ErrMessages } from '../errors';
import { RestaurantRepository } from '../repositories';

const restaurantRepo = new RestaurantRepository();

export const isActiveRestaurant = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			throw new ApplicationError(ErrMessages.http.Unauthorized, StatusCodes.UNAUTHORIZED);
		}

		const { actorId, actorType } = req.user;

		if (actorType !== 'restaurant') {
			throw new ApplicationError(ErrMessages.restaurant.NotRestaurantUser, StatusCodes.FORBIDDEN);
		}

		const restaurant = await restaurantRepo.getRestaurantById(actorId);

		if (!restaurant) {
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, StatusCodes.NOT_FOUND);
		}

		if (!restaurant.isActive) {
			throw new ApplicationError(ErrMessages.restaurant.NoActiveRestaurant, StatusCodes.FORBIDDEN);
		}

		next();
	} catch (error) {
		next(error);
	}
};
