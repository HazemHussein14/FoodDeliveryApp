import { OrderRepository } from '../repositories';
import { ApplicationError, ErrMessages } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { CartItem } from '../models';
import logger from '../config/logger';
import { CustomerService } from './customer.service';
import { RestaurantService } from './restaurant.service';

export class OrderService {
	private orderRepo = new OrderRepository();
	private customerService = new CustomerService();
	private restaurantService = new RestaurantService();

	async placeOrder() {}

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
		const serviceFees = this.calculateServiceFees(totalItemsAmount, settings.serviceFeePercentage) / 100;
		const deliveryFees = this.calculateDeliveryFees(totalItemsAmount, settings.deliveryFeePercentage) / 100;

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
