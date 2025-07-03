import { AppDataSource } from '../config/data-source';
import { Customer, Address, CustomerAddress } from '../models';
import { Repository } from 'typeorm';

export class CustomerRepository {
	private customerRepo: Repository<Customer>;
	private addressRepo: Repository<Address>;
	private customerAddressRepo: Repository<CustomerAddress>;

	constructor() {
		this.customerRepo = AppDataSource.getRepository(Customer);
		this.addressRepo = AppDataSource.getRepository(Address);
		this.customerAddressRepo = AppDataSource.getRepository(CustomerAddress);
	}

	// Customer operations
	async createCustomer(data: Partial<Customer>): Promise<Customer> {
		const customer = this.customerRepo.create(data);
		return await this.customerRepo.save(customer);
	}

	async getCustomerById(customerId: number): Promise<Customer | null> {
		return await this.customerRepo.findOne({
			where: { customerId }
		});
	}

	async getCustomerByUserId(userId: number): Promise<Customer | null> {
		return await this.customerRepo.findOne({
			where: { userId }
		});
	}

	async updateCustomer(customerId: number, data: Partial<Customer>): Promise<Customer | null> {
		await this.customerRepo.update(customerId, data);
		return await this.getCustomerById(customerId);
	}

	// Address operations
	async addAddress(data: Partial<Address>): Promise<Address> {
		const address = this.addressRepo.create(data);
		return await this.addressRepo.save(address);
	}

	async getAddressById(addressId: number): Promise<Address | null> {
		return await this.addressRepo.findOne({
			where: { addressId }
		});
	}

	async getCustomerAddress(addressId: number, customerId: number): Promise<CustomerAddress | null> {
		return await this.customerAddressRepo.findOne({
			where: { addressId, customerId }
		});
	}

	async updateAddress(addressId: number, data: Partial<Address>): Promise<Address | null> {
		await this.addressRepo.update(addressId, data);
		return await this.getAddressById(addressId);
	}

	async deleteAddress(addressId: number): Promise<void> {
		await this.addressRepo.delete(addressId);
	}
}
