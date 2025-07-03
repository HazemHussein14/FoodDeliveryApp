import { MenuRepository, OrderRepository, RestaurantRepository } from '../repositories';
import { ApplicationError, ErrMessages } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { Cart, CartItem, Order, OrderItem } from '../models';
import logger from '../config/logger';
import { CustomerService } from './customer.service';
import { RestaurantService } from './restaurant.service';
import { OrderDto, PlaceOrderDto, PlaceOrderResponse, UpdateOrderStatusDto } from '../dto/order.dto';
import { Transactional } from 'typeorm-transactional';
import { CartService } from './cart.service';
import { PaymentService } from './payment.service';
import NodeCache from 'node-cache';

// Placeholder notification and analytics functions
async function notifyDriver(driverId: number, payload: any) {
	/* TODO: Implement real driver notification */
}
async function notifyCustomer(customerId: number, payload: any) {
	/* TODO: Implement real customer notification */
}
async function notifySupportTeam(payload: any) {
	/* TODO: Implement real support notification */
}
async function updateAnalytics(event: string, payload: any) {
	/* TODO: Implement real analytics update */
}
async function processRefund(customerId: number, paymentId: number, amount: number) {
	return { success: true, refundId: 'mock', error: null };
}
async function queueManualRefund(orderId: number, amount: number, error: string) {
	/* TODO: Implement real manual refund queue */
}

const NON_CANCELLABLE_STATES = ['delivered', 'cancelled', 'refunded'];
const VALID_REASONS = ['OUT_OF_INGREDIENTS', 'TOO_BUSY', 'RESTAURANT_CLOSED', 'TECHNICAL_ISSUE'];

const orderSummaryCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

export class OrderService {
	private orderRepo = new OrderRepository();
	private restaurantRepo = new RestaurantRepository();
	private customerService = new CustomerService();
	private restaurantService = new RestaurantService();
	private cartService = new CartService();
	private paymentService = new PaymentService();
	private menuRepo = new MenuRepository();

	@Transactional()
	async placeOrder(placeOrderDto: PlaceOrderDto) {
		// customer validations
		logger.info(`Validating customer for order for customer ${placeOrderDto.userId}`);
		const customer = await this.customerService.getCustomerByUserId(placeOrderDto.userId);
		await this.customerService.validateDeliveryAddress(placeOrderDto.deliveryAddressId, customer.customerId);

		// cart validations
		logger.info(`Validating cart for order for customer ${customer.customerId}`);
		const cart = await this.cartService.getCartByCustomerId(customer.customerId);
		const { cartItems, restaurantId } = await this.validateCartForOrder(cart);

		// restaurant validations
		logger.info(`Validating restaurant for order for customer ${customer.customerId}`);
		await this.validateRestaurantForOrder(restaurantId);

		// calculate order totals
		logger.info(`Calculating order totals for customer ${customer.customerId}`);
		const orderTotals = await this.calculateOrderTotals(cartItems, restaurantId); // discount will be added later

		// create pending transaction
		logger.info(`Creating pending transaction for customer ${customer.customerId}`);
		const transaction = await this.paymentService.createPendingTransaction({
			customerId: customer.customerId,
			amount: orderTotals.totalAmount,
			paymentMethodId: placeOrderDto.paymentMethodId
		});

		// create order
		logger.info(`Creating order for customer ${customer.customerId}`);
		const order = await this.createOrder({
			customerId: customer.customerId,
			restaurantId: restaurantId,
			deliveryAddressId: placeOrderDto.deliveryAddressId,
			customerInstructions: placeOrderDto.customerInstructions,
			orderStatusId: 1, // pending status id
			placedAt: new Date(),
			discount: 0, // TODO: Add discount
			...orderTotals
		});

		// create order items
		logger.info(`Creating order items for order ${order.orderId} for customer ${customer.customerId}`);
		await this.createOrderItems(order.orderId, cartItems);

		// process payment
		logger.info(`Processing payment for order ${order.orderId} for customer ${customer.customerId}`);
		const paymentResult = await this.paymentService.processPayment(transaction.transactionId, {
			orderId: order.orderId,
			amount: orderTotals.totalAmount
		});

		if (!paymentResult.success) {
			throw new ApplicationError(`Payment failed: ${paymentResult.error}`, StatusCodes.PAYMENT_REQUIRED);
		}

		// update order status to confirmed
		logger.info(`Updating order ${order.orderId} status to processing for customer ${customer.customerId}`);
		await this.orderRepo.updateOrderStatus(order.orderId, 2); // processing status id

		// clear cart
		logger.info(`Clearing cart for customer ${customer.customerId}`);
		// await this.cartService.clearCart(cart.cartId);

		// log success and return response
		// TODO: Send order confirmation email or notification
		logger.info(`Order ${order.orderId} placed successfully for customer ${customer.customerId}`);

		return await this.buildOrderResponse(order.orderId);
	}

	// Get order summary
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
		return orders.map((order) => ({
			orderId: order.orderId,
			state: order.orderStatus.statusName,
			createdAt: order.placedAt,
			restaurantName: order.restaurant && order.restaurant.name ? order.restaurant.name : null,
			totalAmount: order.totalAmount,
			itemCount: order.totalItems
		}));
	}

	// Get order details for a customer
	async getCustomerOrderDetails(orderId: number, userId: number) {
		const customer = await this.customerService.getCustomerByUserId(userId);
		await this.validateOrderBelongsToCustomer(orderId, customer.customerId);

		const order = await this.getOrderById(orderId);

		const orderItems = await this.orderRepo.getOrderItems(orderId);

		return {
			order,
			orderItems
		};
	}

	async getRestaurantOrderDetails(orderId: number, userId: number) {
		// Step 1: Get the restaurant by userId (owner of the order)
		const restaurant = await this.restaurantService.getRestaurantByUserId(userId);

		// Step 2: Validate that the order belongs to this restaurant
		await this.validateOrderBelongsToRestaurant(orderId, restaurant.restaurantId);

		// Step 3: Retrieve the order entity
		const order = await this.getOrderById(orderId);

		// Step 4: Retrieve all order items including item details
		const orderItems = await this.orderRepo.getOrderItems(orderId);

		// Optional: Fetch payment or delivery info if needed

		// Step 5: Return the detailed order
		return {
			order,
			orderItems
		};
	}

	// Get order history
	// TODO: use validateOrderAccess here
	// TODO: add filters and pagination
	async getCustomerOrderHistory(userId: number) {
		const customer = await this.customerService.getCustomerByUserId(userId);
		const orders = await this.orderRepo.getAllOrdersByCustomerId(customer.customerId);

		return orders;
	}

	// TODO: use validateOrderAccess here
	// TODO: add filters and pagination
	async getRestaurantOrderHistory(userId: number) {
		const restaurant = await this.restaurantService.getRestaurantByUserId(userId);
		const orders = await this.orderRepo.getAllOrdersByRestaurantId(restaurant.restaurantId);

		return orders;
	}

	// Update order status
	async updateOrderStatus(orderId: number, request: UpdateOrderStatusDto) {
		// use getOrderById here
		const order = await this.orderRepo.getOrderById(orderId);
		if (!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.NOT_FOUND);
		}

		// TODO: Add getOrderStatusById method and use it here
		const orderStatus = await this.orderRepo.getOrderStatusById(request.statusId);
		if (!orderStatus) {
			throw new ApplicationError(ErrMessages.order.OrderStatusNotFound, StatusCodes.NOT_FOUND);
		}

		await this.orderRepo.updateOrderStatus(orderId, request.statusId);
	}

	// Cancel order
	async cancelOrderByCustomer(userId: number, orderId: number) {
		const customer = await this.customerService.getCustomerByUserId(userId);
		// No need to check if customer exists, customer service will throw error if no customer
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		// TODO: use getOrderById method
		const order = await this.orderRepo.getOrderByCustomerId(orderId, customer.customerId);
		if (!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.NOT_FOUND);
		}

		const orderStatusName = (await this.orderRepo.getOrderStatusById(order.orderStatusId))?.statusName;
		const cancelledStatus = await this.orderRepo.getOrderStatusByName('cancelled');
		if (orderStatusName === 'confirmed' || orderStatusName === 'preparing' || orderStatusName === 'ready_for_pickup') {
			this.orderRepo.updateOrderStatus(orderId, cancelledStatus!.orderStatusId);
		} else {
			throw new ApplicationError(ErrMessages.order.CancellationUnAlllowed, StatusCodes.EXPECTATION_FAILED);
		}
	}

	/**
	 * Cancel order by restaurant with full validation, transaction, refund, and notifications
	 */
	@Transactional()
	async cancelOrderByRestaurant(restaurantId: number, orderId: number, cancellationReason: string) {
		// 1. Authenticate restaurant
		// TODO: use restaurant service
		const restaurant = await this.restaurantRepo.getRestaurantById(restaurantId);
		if (!restaurant) {
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, StatusCodes.UNAUTHORIZED);
		}

		// 2. Validate order
		// TODO: use validateOrderBelongsToRestaurant
		const order = await this.orderRepo.getOrderById(orderId);
		if (!order) {
			throw new ApplicationError('Order not found', StatusCodes.NOT_FOUND);
		}
		if (order.restaurantId !== restaurantId) {
			throw new ApplicationError('Unauthorized: Order belongs to different restaurant', StatusCodes.FORBIDDEN);
		}

		if (NON_CANCELLABLE_STATES.includes(order.orderStatus.statusName)) {
			throw new ApplicationError(
				`Order cannot be cancelled in current state: ${order.orderStatus.statusName}`,
				StatusCodes.BAD_REQUEST
			);
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
		console.log({ orderId, customerId });

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

	// Order Creation Methods
	private async createOrder(orderDto: OrderDto) {
		const order = Order.buildOrder(orderDto);

		return await this.orderRepo.createOrder(order);
	}

	private async createOrderItems(orderId: number, cartItems: CartItem[]) {
		const orderItems: OrderItem[] = [];
		for (const cartItem of cartItems) {
			// TODO: Move to menu service
			const menuItem = await this.menuRepo.getMenuItemByItemAndRestaurant(cartItem.itemId, cartItem.restaurantId);

			if (!menuItem) {
				logger.error(`Item ${cartItem.itemId} does not exist in menu of restaurant ${cartItem.restaurantId}`);
				throw new ApplicationError('Cannot create order now', StatusCodes.INTERNAL_SERVER_ERROR);
			}

			const orderItem = OrderItem.buildOrderItem({
				orderId,
				menuItemId: menuItem.menuItemId,
				quantity: cartItem.quantity,
				itemPrice: cartItem.price,
				totalPrice: cartItem.totalPrice
			});

			orderItems.push(orderItem);
		}
		return await this.orderRepo.createOrderItems(orderItems);
	}

	private async buildOrderResponse(orderId: number): Promise<PlaceOrderResponse> {
		const order = await this.getOrderById(orderId);

		return {
			orderId: order.orderId,
			status: order.orderStatus.statusName,
			totalItemsAmount: order.totalItemsAmount,
			totalItemsQty: order.totalItems,
			deliveryFees: order.deliveryFees,
			serviceFees: order.serviceFees,
			discount: order.discount,
			totalAmount: order.totalAmount,
			paymentStatus: 'completed',
			restaurant: {
				id: order.restaurantId,
				name: order.restaurant.name
			},
			deliveryAddress: {
				addressLine1: order.deliveryAddress.addressLine1,
				addressLine2: order.deliveryAddress.addressLine2,
				city: order.deliveryAddress.city
			},
			customerInstructions: order.customerInstructions,
			orderItems: order.items.map((item) => ({
				orderItemId: item.orderItemId,
				itemName: item.menuItem.item.name,
				quantity: item.quantity,
				itemPrice: item.itemPrice,
				totalPrice: item.totalPrice
			}))
		};
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
}
