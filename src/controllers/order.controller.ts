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

	async viewCustomerOrderSummary(req: Request, res: Response) {}

	async viewRestaurantOrderSummary(req: Request, res: Response) {}

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

	async cancelOrderByRestaurant(req: Request, res: Response) {}
}
