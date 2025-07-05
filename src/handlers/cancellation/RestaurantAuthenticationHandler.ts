import { BaseOrderCancellationHandler } from '../base/BaseOrderCancellationHandler';
import { OrderCancellationContext } from '../base/OrderCancellationContext.interface';
import { RestaurantRepository } from '../../repositories/restaurant.repository';
import { ApplicationError, ErrMessages } from '../../errors';
import { StatusCodes } from 'http-status-codes';

export class RestaurantAuthenticationHandler extends BaseOrderCancellationHandler {
  constructor(private restaurantRepo: RestaurantRepository) {
    super();
  }

  protected async execute(context: OrderCancellationContext): Promise<void> {
    const restaurant = await this.restaurantRepo.getRestaurantById(context.restaurantId);
    if (!restaurant) {
      throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, StatusCodes.UNAUTHORIZED);
    }
    context.restaurant = restaurant;
  }
} 