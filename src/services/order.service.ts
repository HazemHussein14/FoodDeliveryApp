import { OrderRepository, CustomerRepository, RestaurantRepository, CartRepository } from '../repositories';
import { ApplicationError } from '../errors';
import { StatusCodes } from 'http-status-codes';

export class OrderService {
	private orderRepo = new OrderRepository();
	private customerRepo = new CustomerRepository();
	private restaurantRepo = new RestaurantRepository();
	private cartRepo = new CartRepository();

	// Place order
	async placeOrder() {}

	// Get order summary
	async getCustomerOrderSummary() {}

	async getRestaurantOrderSummary() {}

	// Get customer order details
	async getCustomerOrderDetails() {}

	// Get restaurant order details
	async getRestaurantOrderDetails() {}
	// Get customer order history
	async getCustomerOrderHistory() {}

	// Get restaurant order history
	async getRestaurantOrderHistory() {}

	// Update order status
	async updateOrderStatus() {}

	// Cancel order
	async cancelOrderByCustomer() {}

	async cancelOrderByRestaurant() {}

	// Helper methods
}
