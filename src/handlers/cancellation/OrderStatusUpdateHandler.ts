import { BaseOrderCancellationHandler } from '../base/BaseOrderCancellationHandler';
import { OrderCancellationContext } from '../base/OrderCancellationContext.interface';
import { OrderRepository } from '../../repositories/order.repository';

export class OrderStatusUpdateHandler extends BaseOrderCancellationHandler {
  constructor(private orderRepo: OrderRepository) {
    super();
  }

  protected async execute(context: OrderCancellationContext): Promise<void> {
    if (!context.order) throw new Error('Order not loaded in context');
    // Set status to 'cancelled' and update cancellation info
    context.order.orderStatus.statusName = 'cancelled';
    context.order.cancellationInfo = {
      cancelledBy: 'restaurant',
      reason: context.cancellationReason,
      cancelledAt: new Date()
    };
    await this.orderRepo.updateOrder(context.orderId, {
      orderStatusId: context.order.orderStatus.orderStatusId,
      cancellationInfo: context.order.cancellationInfo
    });
  }
} 