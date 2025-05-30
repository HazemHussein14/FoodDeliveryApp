import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';

export class OrderController {
	private orderService = new OrderService();

	async placeOrder(req: Request, res: Response) {}

	async viewCustomerOrderSummary(req: Request, res: Response) {}

	async viewRestaurantOrderSummary(req: Request, res: Response) {}

	async viewRestaurantOrderHistory(req: Request, res: Response) {}

	async viewCustomerOrderHistory(req: Request, res: Response) {}

	async viewCustomerOrderDetails(req: Request, res: Response) {}

	async viewRestaurantOrderDetails(req: Request, res: Response) {}

	async updateOrderStatus(req: Request, res: Response) {}

	async cancelOrderByCustomer(req: Request, res: Response) {}

	async cancelOrderByRestaurant(req: Request, res: Response) {}
}
