import { BaseOrderCancellationHandler } from '../base/BaseOrderCancellationHandler';
import { OrderCancellationContext } from '../base/OrderCancellationContext.interface';
import { OrderRepository } from '../../repositories/order.repository';
import { ApplicationError, ErrMessages } from '../../errors';
import { StatusCodes } from 'http-status-codes';

const NON_CANCELLABLE_STATES = ['delivered', 'cancelled', 'refunded'];
const VALID_REASONS = ['OUT_OF_INGREDIENTS', 'TOO_BUSY', 'RESTAURANT_CLOSED', 'TECHNICAL_ISSUE'];

export class OrderValidationHandler extends BaseOrderCancellationHandler {
  constructor(private orderRepo: OrderRepository) {
    super();
  }

  protected async execute(context: OrderCancellationContext): Promise<void> {
    const order = await this.orderRepo.getOrderById(context.orderId);
    if (!order) {
      throw new ApplicationError('Order not found', StatusCodes.NOT_FOUND);
    }
    if (order.restaurantId !== context.restaurantId) {
      throw new ApplicationError('Unauthorized: Order belongs to different restaurant', StatusCodes.FORBIDDEN);
    }
    if (NON_CANCELLABLE_STATES.includes(order.orderStatus.statusName)) {
      throw new ApplicationError(
        `Order cannot be cancelled in current state: ${order.orderStatus.statusName}`,
        StatusCodes.BAD_REQUEST
      );
    }
    if (!VALID_REASONS.includes(context.cancellationReason)) {
      throw new ApplicationError('Invalid cancellation reason', StatusCodes.BAD_REQUEST);
    }
    context.order = order;
  }
} 