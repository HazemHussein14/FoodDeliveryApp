import { BaseOrderCancellationHandler } from '../base/BaseOrderCancellationHandler';
import { OrderCancellationContext } from '../base/OrderCancellationContext.interface';

async function notifyDriver(driverId: number, payload: any) {
  /* TODO: Implement real driver notification */
}

export class DriverNotificationHandler extends BaseOrderCancellationHandler {
  protected async execute(context: OrderCancellationContext): Promise<void> {
    if (context.order && (context.order as any).driverId) {
      await notifyDriver((context.order as any).driverId, {
        type: 'ORDER_CANCELLED',
        orderId: context.orderId,
        message: 'Order has been cancelled by restaurant'
      });
      // Optionally update driver status here
    }
  }
} 