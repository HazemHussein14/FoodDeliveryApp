import { OrderCancellationContext } from './OrderCancellationContext';

export interface OrderCancellationHandler {
  setNext(handler: OrderCancellationHandler): OrderCancellationHandler;
  handle(context: OrderCancellationContext): Promise<void>;
} 