// This file is deprecated. Use OrderCancellationContext from OrderCancellationContext.ts instead.
import { Restaurant } from '../../models/restaurant/restaurant.entity';
import { Order } from '../../models/order/order.entity';

export interface OrderCancellationContext {
  restaurantId: number;
  orderId: number;
  cancellationReason: string;
  restaurant?: Restaurant;
  order?: Order;
  refundAmount?: number;
  refundStatus?: string;
  refundId?: string | null;
  errors?: string[];
} 