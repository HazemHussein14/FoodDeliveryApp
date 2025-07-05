import { CustomerRepository } from '../repositories';
import { UserRepository } from '../repositories/user.repository';
import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';

export class CustomerService {
	private customerRepo = new CustomerRepository();
	private userRepo = new UserRepository();

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

	async registerCustomer(email: string, data: any): Promise<any> {
		// Check if user already exists
		const existingUser = await this.userRepo.getUserByEmail(email);
		if (existingUser) {
			throw new ApplicationError('Customer already exists', StatusCodes.CONFLICT);
		}
		// Create user
		const user = await this.userRepo.createUser({
			name: data.name,
			email: data.email,
			phone: data.phone,
			password: data.password, // In real app, hash password
			userTypeId: 1, // Assuming 1 is for customer
			isActive: true
		});
		// Assign default role
		await this.userRepo.assignDefaultRole(user.userId, 'customer');
		// Create customer
		const customer = await this.customerRepo.createCustomer({
			userId: user.userId,
			birthDate: data.birthDate,
			gender: data.gender
		});
		return { user, customer };
	}

	async getCustomerProfile(customerId: number): Promise<any> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}
		const user = await this.userRepo.getUserById(customer.userId);
		return {
			customerId: customer.customerId,
			userId: customer.userId,
			name: user?.name,
			email: user?.email,
			phone: user?.phone,
			birthDate: customer.birthDate,
			gender: customer.gender,
			createdAt: customer.createdAt,
			updatedAt: customer.updatedAt
		};
	}

	async updateCustomerProfile(customerId: number, updateData: any): Promise<any> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}
		// Update user info if present
		if (updateData.name || updateData.email || updateData.phone) {
			await this.userRepo.createUser({
				userId: customer.userId,
				...updateData
			});
		}
		// Update customer info
		const updatedCustomer = await this.customerRepo.updateCustomer(customerId, updateData);
		return this.getCustomerProfile(customerId);
	}
}
