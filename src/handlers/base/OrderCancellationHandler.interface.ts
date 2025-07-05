import { OrderCancellationContext } from './OrderCancellationContext.interface';

export interface OrderCancellationHandler {
  setNext(handler: OrderCancellationHandler): OrderCancellationHandler;
  handle(context: OrderCancellationContext): Promise<void>;
} 