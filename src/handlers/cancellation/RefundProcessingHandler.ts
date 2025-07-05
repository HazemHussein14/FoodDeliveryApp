import { BaseOrderCancellationHandler } from '../base/BaseOrderCancellationHandler';
import { OrderCancellationContext } from '../base/OrderCancellationContext.interface';
import { OrderRepository } from '../../repositories/order.repository';

async function processRefund(customerId: number, paymentId: number, amount: number) {
  return { success: true, refundId: 'mock', error: null };
}
async function queueManualRefund(orderId: number, amount: number, error: string) {
  /* TODO: Implement real manual refund queue */
}

function calculateRefundAmount(order: any): number {
  const base = Number(order.totalAmount);
  switch (order.orderStatus.statusName) {
    case 'pending':
    case 'confirmed':
      return base;
    case 'preparing':
      return base * 0.9;
    case 'ready_for_pickup':
      return base * 0.8;
    case 'out_for_delivery':
      return base * 0.7;
    default:
      return 0;
  }
}

export class RefundProcessingHandler extends BaseOrderCancellationHandler {
  constructor(private orderRepo: OrderRepository) {
    super();
  }

  protected async execute(context: OrderCancellationContext): Promise<void> {
    if (!context.order) throw new Error('Order not loaded in context');
    const refundAmount = calculateRefundAmount(context.order);
    context.refundAmount = refundAmount;
    let refundStatus = 'NONE';
    let refundId = null;
    if (refundAmount > 0) {
      const refundResult = await processRefund(context.order.customerId, (context.order as any).paymentId, refundAmount);
      if (refundResult.success) {
        refundStatus = 'PROCESSED';
        refundId = refundResult.refundId;
      } else {
        await queueManualRefund(context.orderId, refundAmount, refundResult.error || 'Unknown error');
        refundStatus = 'PENDING';
      }
      context.order.cancellationInfo = {
        ...context.order.cancellationInfo,
        refundAmount,
        refundStatus,
        refundId
      };
      await this.orderRepo.updateOrder(context.orderId, {
        cancellationInfo: context.order.cancellationInfo
      });
    }
    context.refundStatus = refundStatus;
    context.refundId = refundId;
  }
} 