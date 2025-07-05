import { RestaurantRepository } from '../../repositories/restaurant.repository';
import { OrderRepository } from '../../repositories/order.repository';
import { OrderCancellationHandler } from '../base/OrderCancellationHandler.interface';
import { RestaurantAuthenticationHandler } from '../cancellation/RestaurantAuthenticationHandler';
import { OrderValidationHandler } from '../cancellation/OrderValidationHandler';
import { OrderStatusUpdateHandler } from '../cancellation/OrderStatusUpdateHandler';
import { DriverNotificationHandler } from '../cancellation/DriverNotificationHandler';
import { RefundProcessingHandler } from '../cancellation/RefundProcessingHandler';
import { NotificationHandler } from '../cancellation/NotificationHandler';
import { LoggingHandler } from '../cancellation/LoggingHandler';

export interface HandlerDependencies {
  restaurantRepo: RestaurantRepository;
  orderRepo: OrderRepository;
}

export class OrderCancellationHandlerFactory {
  static createCancellationChain(deps: HandlerDependencies): OrderCancellationHandler {
    const authHandler = new RestaurantAuthenticationHandler(deps.restaurantRepo);
    const validationHandler = new OrderValidationHandler(deps.orderRepo);
    const statusUpdateHandler = new OrderStatusUpdateHandler(deps.orderRepo);
    const driverNotificationHandler = new DriverNotificationHandler();
    const refundHandler = new RefundProcessingHandler(deps.orderRepo);
    const notificationHandler = new NotificationHandler();
    const loggingHandler = new LoggingHandler();

    authHandler
      .setNext(validationHandler)
      .setNext(statusUpdateHandler)
      .setNext(driverNotificationHandler)
      .setNext(refundHandler)
      .setNext(notificationHandler)
      .setNext(loggingHandler);

    return authHandler;
  }
} 