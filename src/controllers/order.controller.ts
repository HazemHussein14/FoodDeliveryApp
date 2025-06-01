import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { PlaceOrderDto } from '../dto/order.dto';

export class OrderController {
	private orderService = new OrderService();

	async placeOrder(req: Request, res: Response) {
		const placeOrderDto: PlaceOrderDto = req.validated?.body;

		const order = await this.orderService.placeOrder(placeOrderDto);
		sendResponse(res, StatusCodes.CREATED, 'Order Placed Successfully', order);
	}

	async viewCustomerOrderSummary(req: Request, res: Response) {}

	async viewRestaurantOrderSummary(req: Request, res: Response) {}

	async viewCustomerOrderHistory(req: Request, res: Response): Promise<void> {
		const userId = req.user?.userId;

		if (!userId) {
			sendResponse(res, StatusCodes.UNAUTHORIZED, 'Unauthorized: userId missing');
			return;
		}

		const orders = await this.orderService.getCustomerOrderHistory(userId);
		sendResponse(res, StatusCodes.OK, 'Customer order history fetched successfully', orders);
	}

	async viewRestaurantOrderHistory(req: Request, res: Response): Promise<void> {
		const userId = req.user?.userId;

		if (!userId) {
			sendResponse(res, StatusCodes.UNAUTHORIZED, 'Unauthorized: userId missing');
			return;
		}

		const orders = await this.orderService.getRestaurantOrderHistory(userId);
		sendResponse(res, StatusCodes.OK, 'Restaurant order history fetched successfully', orders);
	}

	async viewCustomerOrderDetails(req: Request, res: Response): Promise<void> {
		const { orderId } = req.validated?.params;
		const userId = req.user?.userId;

		if (!userId) {
			sendResponse(res, StatusCodes.UNAUTHORIZED, 'Unauthorized: userId missing');
			return;
		}

		const orderDetails = await this.orderService.getCustomerOrderDetails(+orderId, userId);
		sendResponse(res, StatusCodes.OK, 'Order details fetched successfully', orderDetails);
	}

	async viewRestaurantOrderDetails(req: Request, res: Response): Promise<void> {
		const { orderId } = req.validated?.params;
		const userId = req.user?.userId;

		if (!userId) {
			sendResponse(res, StatusCodes.UNAUTHORIZED, 'Unauthorized: userId missing');
			return;
		}

		const orderDetails = await this.orderService.getRestaurantOrderDetails(+orderId, userId);
		sendResponse(res, StatusCodes.OK, 'Order details fetched successfully', orderDetails);
	}
	async updateOrderStatus(req: Request, res: Response) {}

	async cancelOrderByCustomer(req: Request, res: Response) {}

	async cancelOrderByRestaurant(req: Request, res: Response) {}
}
