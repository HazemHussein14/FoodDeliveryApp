import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CustomerService } from '../services';

export class CustomerController {
	private customerService = new CustomerService();

	async deactivte(request: Request, response: Response) {
		const { customerId } = request.validated?.params;

		await this.customerService.deactivateCustomer(customerId);
		sendResponse(response, StatusCodes.OK, 'Customer account deactivated');
	}

	async viewOrderStatus(request: Request, response: Response) {
		const { orderId, customerId } = request.validated?.params;

		const orderStatus = await this.customerService.getCustomerOrderStatus(customerId, orderId);
		sendResponse(response, StatusCodes.OK, 'Order status permormed successfully', orderStatus);
	}

	async submitOrderFeedback(request: Request, response: Response) {
		const { orderId, customerId } = request.validated?.params;
		const { rating, comment } = request.validated?.body || {};

		await this.customerService.submitOrderFeedback(customerId, orderId, rating, comment);
		sendResponse(response, StatusCodes.CREATED, 'feedback submitted successfully');
	}

	async viewOrderHistory(request: Request, response: Response) {
		const { customerId } = request.validated?.params;

		const orderHistory = await this.customerService.getOrderHistory(customerId);
		sendResponse(response, StatusCodes.OK, 'Order history retrieved successfully', orderHistory);
	}

	async addAddress(request: Request, response: Response) {
		const { customerId } = request.validated?.params;
		const address = await this.customerService.addAddress(customerId, request.validated?.body);
		sendResponse(response, StatusCodes.CREATED, 'Address added successfully', address);
	}

	async updateAddress(request: Request, response: Response) {
		const { customerId, addressId } = request.validated?.params;
		const address = await this.customerService.updateAddress(customerId, addressId, request.validated?.body);
		sendResponse(response, StatusCodes.OK, 'Address updated successfully', address);
	}

	async deleteAddress(request: Request, response: Response) {
		const { customerId, addressId } = request.validated?.params;
		await this.customerService.deleteAddress(customerId, addressId);
		sendResponse(response, StatusCodes.OK, 'Address deleted successfully');
	}

	async getAddress(request: Request, response: Response) {
		const { customerId, addressId } = request.validated?.params;
		const address = await this.customerService.getAddress(customerId, addressId);
		sendResponse(response, StatusCodes.OK, 'Address retrieved successfully', address);
	}

	async getAllAddresses(request: Request, response: Response) {
		const { customerId } = request.validated?.params;
		const addresses = await this.customerService.getAllAddresses(customerId);
		sendResponse(response, StatusCodes.OK, 'Addresses retrieved successfully', addresses);
	}

	async setDefaultAddress(request: Request, response: Response) {
		const { customerId, addressId } = request.validated?.params;
		await this.customerService.setDefaultAddress(customerId, addressId);
		sendResponse(response, StatusCodes.OK, 'Default address set successfully');
	}

	async setPreferredPaymentMethod(request: Request, response: Response) {
		const { customerId } = request.validated?.params;
		const { paymentMethodId } = request.validated?.body;
		await this.customerService.setPreferredPaymentMethod(customerId, paymentMethodId);
		sendResponse(response, StatusCodes.OK, 'Preferred payment method set successfully');
	}
}
