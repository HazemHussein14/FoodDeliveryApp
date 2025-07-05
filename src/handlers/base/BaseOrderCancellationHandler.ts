import { OrderCancellationHandler } from './OrderCancellationHandler.interface';
import { OrderCancellationContext } from './OrderCancellationContext';

export abstract class BaseOrderCancellationHandler implements OrderCancellationHandler {
  private nextHandler?: OrderCancellationHandler;

  setNext(handler: OrderCancellationHandler): OrderCancellationHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(context: OrderCancellationContext): Promise<void> {
    await this.execute(context);
    if (this.nextHandler) {
      await this.nextHandler.handle(context);
    }
  }

  protected abstract execute(context: OrderCancellationContext): Promise<void>;
} 