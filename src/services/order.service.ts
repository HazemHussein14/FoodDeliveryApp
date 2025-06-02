import { OrderRepository } from '../repositories';
import { ApplicationError, ErrMessages } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { Cart, CartItem } from '../models';
import logger from '../config/logger';
import { CustomerService } from './customer.service';
import { RestaurantService } from './restaurant.service';
import { PlaceOrderDto, UpdateOrderStatusDto } from '../dto/order.dto';
import { Transactional } from 'typeorm-transactional';
import { CartService } from './cart.service';
import { UserService } from './user.service';

export class OrderService {
	private orderRepo = new OrderRepository();
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
	async updateOrderStatus(orderId: number, request: UpdateOrderStatusDto) {
		const order = await this.orderRepo.getOrderById(orderId);
		if (!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.NOT_FOUND);
		}

		const orderStatus = await this.orderRepo.getOrderStatusById(request.statusId);
		if (!orderStatus) {
			throw new ApplicationError(ErrMessages.order.OrderStatusNotFound, StatusCodes.NOT_FOUND);
		}
		
		await this.orderRepo.updateOrderStatus(orderId, request.statusId);
	}

	// Cancel order
	async cancelOrderByCustomer(userId: number, orderId: number) {
		const customer = await this.customerService.getCustomerByUserId(userId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const order = await this.orderRepo.getOrderByCustomerId(orderId, customer.customerId);
		if(!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.NOT_FOUND);
		}

		const orderStatusName = (await this.orderRepo.getOrderStatusById(order.orderStatusId))?.statusName;
		const cancelledStatus = await this.orderRepo.getOrderStatusByName("cancelled");
		if (orderStatusName === 'confirmed' || orderStatusName === 'preparing' || orderStatusName === 'ready_for_pickup') {
			this.orderRepo.updateOrderStatus(orderId, cancelledStatus!.orderStatusId);
		}
		else {
			throw new ApplicationError(ErrMessages.order.CancellationUnAlllowed, StatusCodes.EXPECTATION_FAILED)
		}
	}

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
