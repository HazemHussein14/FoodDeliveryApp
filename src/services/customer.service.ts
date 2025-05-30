import { CustomerRepository } from '../repositories';
import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';

export class CustomerService {
	private customerRepo = new CustomerRepository();

	async getCustomerByUserId(userId: number) {
		const customer = await this.customerRepo.getCustomerByUserId(userId);

		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		return customer;
	}

	async validateDeliveryAddress(addressId: number, customerId: number) {
		const address = await this.customerRepo.getCustomerAddress(addressId, customerId);
		if (!address || address.customerId !== customerId) {
			throw new ApplicationError(ErrMessages.auth.AccessDenied, StatusCodes.FORBIDDEN);
		}
	}
}
