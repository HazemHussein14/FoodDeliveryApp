import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { PlaceOrderDto } from '../dto/order.dto';
import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../models';

export class OrderController {
	private orderService = new OrderService();
	private orderRepo: OrderRepository;

	constructor() {
		this.orderRepo = new OrderRepository();
	}

	async placeOrder(req: Request, res: Response) {
		const placeOrderDto: PlaceOrderDto = req.validated?.body;

		const order = await this.orderService.placeOrder(placeOrderDto);
		sendResponse(res, StatusCodes.CREATED, 'Order Placed Successfully', order);
	}

	async viewCustomerOrderSummary(req: Request, res: Response) {}

	async viewRestaurantOrderSummary(req: Request, res: Response) {}

	async viewRestaurantOrderHistory(req: Request, res: Response) {}

	async viewCustomerOrderHistory(req: Request, res: Response) {}

	async viewCustomerOrderDetails(req: Request, res: Response) {}

	async viewRestaurantOrderDetails(req: Request, res: Response) {}

	async updateOrderStatus(req: Request, res: Response) {
		const { orderId } = req.validated?.params;
		const { orderStatusId } = req.validated?.body;
		const order = await this.orderRepo.getOrderById(Number(orderId));
		if (!order) {
			return sendResponse(res, StatusCodes.NOT_FOUND, 'Order not found');
		}
		const updatedOrder = await this.orderRepo.updateOrderStatus(Number(orderId), Number(orderStatusId));
		sendResponse(res, StatusCodes.OK, 'Order status updated successfully', updatedOrder);
	}

	async cancelOrderByCustomer(req: Request, res: Response) {}

	async cancelOrderByRestaurant(req: Request, res: Response) {}

	/**
	 * POST /orders/:orderId/cancel-by-restaurant
	 * Body: { restaurantId: number, reason: string }
	 */
	async cancelByRestaurant(req: Request, res: Response) {
		const orderId = Number(req.validated?.params.orderId);
		const { restaurantId, reason } = req.body;
		const result = await this.orderService.cancelOrderByRestaurant(restaurantId, orderId, reason);
		sendResponse(res, 200, 'Order cancelled successfully', result);
	}

	/**
	 * GET /orders/:orderId/summary
	 * Query: userId, userType
	 */
	async getOrderSummary(req: Request, res: Response) {
		const orderId = Number(req.validated?.params.orderId);
		const userId = Number(req.query.userId);
		const userType = String(req.query.userType || 'customer');

		const result = await this.orderService.getOrderSummary(userId, userType, orderId);
		sendResponse(res, 200, 'Order summary fetched successfully', result);
	}

	/**
	 * GET /orders/summary
	 * Query: userId, userType, filters, pagination
	 */
	async getOrdersSummary(req: Request, res: Response) {
		const userId = Number(req.query.userId);
		const userType = String(req.query.userType || 'customer');

		// TODO: Parse filters and pagination from query
		const result = await this.orderService.getOrdersSummary(userId, userType);
		sendResponse(res, 200, 'Orders summary fetched successfully', result);
	}

	async createOrder(req: Request, res: Response) {
		const orderData = req.validated?.body;
		const order = Order.buildOrder(orderData);
		const createdOrder = await this.orderRepo.createOrder(order);
		sendResponse(res, StatusCodes.CREATED, 'Order created successfully', createdOrder);
	}

	async getOrders(req: Request, res: Response) {
		const { page = 1, limit = 10, status, startDate, endDate, sortBy, sortOrder } = req.validated?.query;
		const orders = await this.orderRepo.getOrders({
			page: Number(page),
			limit: Number(limit),
			status,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			sortBy,
			sortOrder
		});
		sendResponse(res, StatusCodes.OK, 'Orders retrieved successfully', orders);
	}

	async getOrderById(req: Request, res: Response) {
		const { orderId } = req.validated?.params;
		const order = await this.orderRepo.getOrderById(Number(orderId));
		if (!order) {
			return sendResponse(res, StatusCodes.NOT_FOUND, 'Order not found');
		}
		sendResponse(res, StatusCodes.OK, 'Order retrieved successfully', order);
	}

	async cancelOrder(req: Request, res: Response) {
		const { orderId } = req.validated?.params;
		const { cancellationReason, cancelledBy } = req.validated?.body;
		const order = await this.orderRepo.getOrderById(Number(orderId));
		if (!order) {
			return sendResponse(res, StatusCodes.NOT_FOUND, 'Order not found');
		}
		const cancelledOrder = await this.orderRepo.cancelOrder(Number(orderId), {
			reason: cancellationReason,
			cancelledBy,
			cancelledAt: new Date()
		});
		sendResponse(res, StatusCodes.OK, 'Order cancelled successfully', cancelledOrder);
	}
}
