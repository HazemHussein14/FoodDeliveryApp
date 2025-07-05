import { BaseOrderCancellationHandler } from '../base/BaseOrderCancellationHandler';
import { OrderCancellationContext } from '../base/OrderCancellationContext.interface';
import logger from '../../config/logger';

export class LoggingHandler extends BaseOrderCancellationHandler {
  protected async execute(context: OrderCancellationContext): Promise<void> {
    logger.info({
      type: 'ORDER_CANCELLED',
      orderId: context.orderId,
      restaurantId: context.restaurantId,
      reason: context.cancellationReason,
      refundAmount: context.refundAmount,
      refundStatus: context.refundStatus,
      timestamp: new Date()
    });
    if (context.errors && context.errors.length > 0) {
      logger.error('Order cancellation errors:', context.errors);
    }
  }
} 