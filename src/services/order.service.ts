import { MenuRepository, OrderRepository } from '../repositories';
import { ApplicationError, ErrMessages } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { Cart, CartItem, Order, OrderItem } from '../models';
import logger from '../config/logger';
import { CustomerService } from './customer.service';
import { RestaurantService } from './restaurant.service';
import { OrderDto, PlaceOrderDto, PlaceOrderResponse } from '../dto/order.dto';
import { Transactional } from 'typeorm-transactional';
import { CartService } from './cart.service';
import { PaymentService } from './payment.service';

export class OrderService {
	private orderRepo = new OrderRepository();
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

	async cancelOrderByRestaurant() {}

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
}
