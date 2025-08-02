import { Request, Response, NextFunction } from 'express';
import { CustomerRepository, RestaurantRepository } from '../repositories';
import { StatusCodes } from 'http-status-codes';
import { ApplicationError, ErrMessages } from '../errors';

// Initialize repositories
const customerRepo = new CustomerRepository();
const restaurantRepo = new RestaurantRepository();

// Define accepted actor types
type actorType = 'customer' | 'restaurant_user' | 'restaurant_owner';
interface actorTypeOptions {
	allowedActorTypes: actorType[]; // List of permitted actor types for this route
}

// Middleware to verify that the user (actor) has permission to access the route
// TODO: Consider adding role-based strategy pattern in the future
export const verifyActor =
	({ allowedActorTypes }: actorTypeOptions) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		const { actorId, actorType } = req?.user || {}; // Extract actor info from request

		// If actor info is missing or not allowed → throw forbidden
		if (!actorId || !actorType || !allowedActorTypes.includes(actorType as actorType)) {
			throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);
		}

		let actor = null;

		// Load actor based on their type
		if (actorType.includes('customer')) {
			actor = await customerRepo.getCustomerById(actorId);
		} else if (actorType.includes('restaurant')) {
			actor = await restaurantRepo.getRestaurantBy({ restaurantId: actorId });
		}

		// If actor not found → throw forbidden
		if (!actor) {
			throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);
		}

		// Proceed to next middleware/handler
		next();
	};
