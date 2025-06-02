import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { PlaceOrderDto, UpdateOrderStatusDto } from '../dto/order.dto';

export class OrderController {
	private orderService = new OrderService();

	async placeOrder(req: Request, res: Response) {
		const placeOrderDto: PlaceOrderDto = req.validated?.body;

		const order = await this.orderService.placeOrder(placeOrderDto);
		sendResponse(res, StatusCodes.CREATED, 'Order Placed Successfully', order);
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
	 * returns order summary for customer or restaurant
	 */
	async getOrdersSummary(req: Request, res: Response) {
		const userId = Number(req.query.userId);
		const userType = String(req.query.userType || 'customer');

		// TODO: Parse filters and pagination from query
		const result = await this.orderService.getOrdersSummary(userId, userType);
		sendResponse(res, 200, 'Orders summary fetched successfully', result);
	}

	async viewRestaurantOrderHistory(req: Request, res: Response) {}

	async viewCustomerOrderHistory(req: Request, res: Response) {}

	async viewCustomerOrderDetails(req: Request, res: Response) {}

	async viewRestaurantOrderDetails(req: Request, res: Response) {}

	async updateOrderStatus(req: Request, res: Response) {
		const request: UpdateOrderStatusDto = req.validated?.body;
		await this.orderService.updateOrderStatus(req.validated?.params?.orderId, request);
	}

	async cancelOrderByCustomer(req: Request, res: Response) {
		const userId = req.validated?.body.userId;
		const orderId = req.validated?.params.orderId;

		await this.orderService.cancelOrderByCustomer(userId, orderId);
	}

	/**
	 * POST /orders/:orderId/cancel-by-restaurant
	 * Body: { restaurantId: number, reason: string }
	 */
	async cancelOrderByRestaurant(req: Request, res: Response) {
		const orderId = Number(req.validated?.params.orderId);
		const { restaurantId, reason } = req.body;
		const result = await this.orderService.cancelOrderByRestaurant(restaurantId, orderId, reason);
		sendResponse(res, 200, 'Order cancelled successfully', result);
	}
}
