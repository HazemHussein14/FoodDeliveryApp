export interface OrderCancellationContext {
  orderId: number;
  reason: string;
  userId: number;
  // Add more fields as needed (e.g., transaction manager, order entity, etc.)
} 