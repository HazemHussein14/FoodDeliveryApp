import { Cart, CartItem } from '../models';
import logger from '../config/logger';
import { CustomerService } from './customer.service';
import { RestaurantService } from './restaurant.service';
import { PlaceOrderDto } from '../dto/order.dto';
import { Transactional } from 'typeorm-transactional';
import { CartService } from './cart.service';

import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../config/data-source';
import { OrderRepository, RestaurantRepository } from '../repositories';
import { ErrMessages, ApplicationError } from '../errors';
import { Order, Restaurant } from '../models';
import NodeCache from 'node-cache';

// Placeholder notification and analytics functions
async function notifyDriver(driverId: number, payload: any) { /* TODO: Implement real driver notification */ }
async function notifyCustomer(customerId: number, payload: any) { /* TODO: Implement real customer notification */ }
async function notifySupportTeam(payload: any) { /* TODO: Implement real support notification */ }
async function updateAnalytics(event: string, payload: any) { /* TODO: Implement real analytics update */ }
async function processRefund(customerId: number, paymentId: number, amount: number) { return { success: true, refundId: 'mock', error: null }; }
async function queueManualRefund(orderId: number, amount: number, error: string) { /* TODO: Implement real manual refund queue */ }

const NON_CANCELLABLE_STATES = ['delivered', 'cancelled', 'refunded'];
const VALID_REASONS = ['OUT_OF_INGREDIENTS', 'TOO_BUSY', 'RESTAURANT_CLOSED', 'TECHNICAL_ISSUE'];

const orderSummaryCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

export class OrderService {
  private orderRepo = new OrderRepository();
  private restaurantRepo = new RestaurantRepository();
	private customerService = new CustomerService();
	private restaurantService = new RestaurantService();
	private cartService = new CartService();

	@Transactional()
	async placeOrder(placeOrderDto: PlaceOrderDto) {
		// customer validations
		const customer = await this.customerService.getCustomerByUserId(placeOrderDto.userId);
		await this.customerService.validateDeliveryAddress(placeOrderDto.deliveryAddressId, customer.customerId);

		// cart validations
		const cart = await this.cartService.getCartByCustomerId(customer.customerId);
		const { cartItems, restaurantId } = await this.validateCartForOrder(cart);

		// restaurant validations
		await this.validateRestaurantForOrder(restaurantId);

		// calculate order totals
		const orderTotals = await this.calculateOrderTotals(cartItems, restaurantId); // discount will be added later

		return {
			orderTotals,
			cartItems
		};
	}

	// Get order summary
	async getCustomerOrderSummary() {}

	async getRestaurantOrderSummary() {}

	// Get order details
	async getCustomerOrderDetails() {}

	async getRestaurantOrderDetails() {}

	// Get order history
	async getCustomerOrderHistory() {}

	async getRestaurantOrderHistory() {}

	// Update order status
	async updateOrderStatus() {}

	// Cancel order
	async cancelOrderByCustomer() {}

	// Validation Methods
	async getOrderById(orderId: number) {
		const order = await this.orderRepo.getOrderById(orderId);
		if (!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.NOT_FOUND);
		}
		return order;
	}

	async validateOrderItemBelongsToOrder(orderId: number, orderItemId: number) {
		const orderItem = await this.orderRepo.getOrderItemByOrderId(orderId, orderItemId);
		if (!orderItem) {
			throw new ApplicationError(ErrMessages.order.OrderItemNotFound, StatusCodes.NOT_FOUND);
		}
		return orderItem;
	}

	async validateOrderAccess(orderId: number, userId: number, userType: string) {
		const order = await this.getOrderById(orderId);

		if (userType === 'customer') {
			const customer = await this.customerService.getCustomerByUserId(userId);

			if (order.customerId !== customer.customerId) {
				throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.FORBIDDEN);
			}
		}

		if (userType === 'restaurant') {
			const restaurant = await this.restaurantService.getRestaurantByUserId(userId);

			if (order.restaurantId !== restaurant.restaurantId) {
				throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.FORBIDDEN);
			}
		}
	}

	async validateOrderBelongsToCustomer(orderId: number, customerId: number) {
		const order = await this.orderRepo.getOrderByCustomerId(orderId, customerId);
		if (!order) {
			throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.FORBIDDEN);
		}
	}

	async validateOrderBelongsToRestaurant(orderId: number, restaurantId: number) {
		const order = await this.orderRepo.getOrderByRestaurantId(orderId, restaurantId);
		if (!order) {
			throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.FORBIDDEN);
		}
	}

	private async validateCartForOrder(cart: Cart) {
		// validate cart is not empty
		const cartItems = cart.cartItems;
		if (!cartItems || cartItems.length === 0) {
			throw new ApplicationError(ErrMessages.cart.CartIsEmpty, StatusCodes.BAD_REQUEST);
		}

		// validate all items belong to same restaurant
		const restaurantId = cartItems[0].restaurantId;
		const allItemsBelongToSameRestaurant = cartItems.every((item) => item.restaurantId === restaurantId);
		// TODO: Add better error message (show which items do not belong to same restaurant)
		if (!allItemsBelongToSameRestaurant) {
			throw new ApplicationError(ErrMessages.cart.CartItemsDoesNotBelongToSameRestaurant, StatusCodes.BAD_REQUEST);
		}

		// validate all items are available
		const allItemsAreAvailable = cartItems.every((item) => item.item.isAvailable);
		// TODO: Add better error message (show which items are not available)
		if (!allItemsAreAvailable) {
			throw new ApplicationError(ErrMessages.item.ItemNotAvailable, StatusCodes.BAD_REQUEST);
		}

		return { cartItems, restaurantId };
	}

	private async validateRestaurantForOrder(restaurantId: number) {
		await this.restaurantService.validateRestaurantIsActive(restaurantId);
		await this.restaurantService.validateRestaurantIsOpen(restaurantId);
	}

	// Manage Order Status Methods
	validateOrderStatusTransition() {}

	canCustomerCancelOrder() {}

	canRestaurantCancelOrder() {}

	// Order Calculation Methods
	calculateServiceFees(totalAmount: number, serviceFeePercentage: number) {
		return (totalAmount * serviceFeePercentage) / 100;
	}

	calculateDeliveryFees(totalAmount: number, deliveryFeePercentage: number) {
		return (totalAmount * deliveryFeePercentage) / 100;
	}

	async calculateOrderTotals(cartItems: CartItem[], restaurantId: number, discountAmount: number = 0) {
		const restaurant = await this.restaurantService.getRestaurantById(restaurantId);

		if (!restaurant.restaurantSetting) {
			logger.error(`Restaurant ${restaurantId} has no settings`);
			throw new ApplicationError('Cannot Create Order now', StatusCodes.INTERNAL_SERVER_ERROR);
		}

		const settings = restaurant.restaurantSetting;

		let totalItemsAmount = 0;
		let totalItemsQty = 0;

		for (const item of cartItems) {
			totalItemsAmount += item.calculateTotalPrice();
			totalItemsQty += item.quantity;
		}

		// calculate fees
		const serviceFees = this.calculateServiceFees(totalItemsAmount, settings.serviceFeePercentage);
		const deliveryFees = this.calculateDeliveryFees(totalItemsAmount, settings.deliveryFeePercentage);

		// calculate total amount
		const totalAmount = totalItemsAmount + deliveryFees + serviceFees - discountAmount;

		return {
			totalItemsQty: totalItemsQty,
			totalItemsAmount: parseFloat(totalItemsAmount.toFixed(2)),
			serviceFees: parseFloat(serviceFees.toFixed(2)),
			deliveryFees: parseFloat(deliveryFees.toFixed(2)),
			totalAmount: parseFloat(totalAmount.toFixed(2))
		};
	}

  // Utility: Calculate refund amount based on order state
  private calculateRefundAmount(order: Order): number {
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

  /**
   * Cancel order by restaurant with full validation, transaction, refund, and notifications
   */
  @Transactional()
  async cancelOrderByRestaurant(restaurantId: number, orderId: number, cancellationReason: string) {
    // 1. Authenticate restaurant
    const restaurant = await this.restaurantRepo.getRestaurantById(restaurantId);
    if (!restaurant) {
      throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, StatusCodes.UNAUTHORIZED);
    }

    // 2. Validate order
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new ApplicationError('Order not found', StatusCodes.NOT_FOUND);
    }
    if (order.restaurantId !== restaurantId) {
      throw new ApplicationError('Unauthorized: Order belongs to different restaurant', StatusCodes.FORBIDDEN);
    }
    if (NON_CANCELLABLE_STATES.includes(order.orderStatus.statusName)) {
      throw new ApplicationError(`Order cannot be cancelled in current state: ${order.orderStatus.statusName}`, StatusCodes.BAD_REQUEST);
    }
    if (!VALID_REASONS.includes(cancellationReason)) {
      throw new ApplicationError('Invalid cancellation reason', StatusCodes.BAD_REQUEST);
    }

    // 3. Begin transaction
    try {
      // Update order state and cancellation info
      order.orderStatus.statusName = 'cancelled';
      order.cancellationInfo = {
        cancelledBy: 'restaurant',
        reason: cancellationReason,
        cancelledAt: new Date()
      };
      await this.orderRepo.updateOrder(orderId, {
        orderStatusId: order.orderStatus.orderStatusId,
        cancellationInfo: order.cancellationInfo
      });

      // Log event (placeholder)
      logger.info({
        type: 'ORDER_CANCELLED',
        orderId,
        restaurantId,
        reason: cancellationReason,
        timestamp: new Date()
      });

      // Notify driver if assigned
      if ((order as any).driverId) {
        await notifyDriver((order as any).driverId, {
          type: 'ORDER_CANCELLED',
          orderId,
          message: 'Order has been cancelled by restaurant'
        });
        // Optionally update driver status here
      }

      // Calculate and process refund
      const refundAmount = this.calculateRefundAmount(order);
      let refundStatus = 'NONE';
      let refundId = null;
      if (refundAmount > 0) {
        const refundResult = await processRefund(order.customerId, (order as any).paymentId, refundAmount);
        if (refundResult.success) {
          refundStatus = 'PROCESSED';
          refundId = refundResult.refundId;
        } else {
          await queueManualRefund(orderId, refundAmount, refundResult.error || 'Unknown error');
          refundStatus = 'PENDING';
        }
        // Store refund info in cancellationInfo for now (extend schema in future)
        order.cancellationInfo = {
          ...order.cancellationInfo,
          refundAmount,
          refundStatus,
          refundId
        };
        await this.orderRepo.updateOrder(orderId, {
          cancellationInfo: order.cancellationInfo
        });
      }

      // Parallel notifications
      await Promise.all([
        notifyCustomer(order.customerId, {
          type: 'ORDER_CANCELLED',
          orderId,
          reason: 'Restaurant had to cancel your order',
          refundAmount,
          estimatedRefundTime: '3-5 business days'
        }),
        notifySupportTeam({
          type: 'ORDER_CANCELLED_BY_RESTAURANT',
          orderId,
          restaurantId,
          reason: cancellationReason
        }),
        updateAnalytics('restaurant_cancellation', {
          restaurantId,
          reason: cancellationReason,
          orderValue: order.totalAmount
        })
      ]);

      return {
        message: 'Order cancelled successfully',
        refundAmount,
        refundStatus
      };
    } catch (err: any) {
      logger.error('Order cancellation failed', err);
      throw new ApplicationError('Cancellation failed: ' + err.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get a single order summary, with enrichment and caching
   */
  async getOrderSummary(userId: number, userType: string, orderId: number) {
    const cacheKey = `order_summary_${orderId}`;
    const cached = orderSummaryCache.get(cacheKey);
    if (cached) return cached;

    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) throw new ApplicationError('Order not found', StatusCodes.NOT_FOUND);
    // TODO: Add role-based access check here

    // Enrich order data (mocked for now)
    const restaurant = order.restaurant;
    const customer = order.customer;
    const items = await this.orderRepo.getOrderItems(orderId);
    // TODO: Add driver, payment, timeline enrichment

    const summary = {
      orderId: order.orderId,
      state: order.orderStatus.statusName,
      createdAt: order.placedAt,
      updatedAt: order.updatedAt,
      customer: customer && customer.user ? { id: customer.customerId, name: customer.user.name } : null,
      restaurant: restaurant ? { id: restaurant.restaurantId, name: restaurant.name } : null,
      items,
      pricing: {
        subtotal: order.totalItemsAmount,
        deliveryFee: order.deliveryFees,
        serviceFee: order.serviceFees,
        discount: order.discount,
        total: order.totalAmount
      },
      timeline: [], // TODO: implement getOrderTimeline
      cancellationInfo: order.cancellationInfo
    };
    orderSummaryCache.set(cacheKey, summary);
    return summary;
  }

  /**
   * Get multiple orders summary with filters and pagination
   */
  async getOrdersSummary(userId: number, userType: string, filters: any = {}, pagination: any = {}) {
    // TODO: Add role-based access check here
    // TODO: Add filter and pagination logic
    const orders = await this.orderRepo.getAllOrdersByCustomerId(userId); // Example: customer orders
    // TODO: Support for restaurant/admin views
    return orders.map(order => ({
      orderId: order.orderId,
      state: order.orderStatus.statusName,
      createdAt: order.placedAt,
      restaurantName: order.restaurant && order.restaurant.name ? order.restaurant.name : null,
      totalAmount: order.totalAmount,
      itemCount: order.totalItems
    }));
  }
} 