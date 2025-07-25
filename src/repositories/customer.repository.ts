import { AppDataSource } from '../config/data-source';
import { Customer, Address, CustomerAddress, PaymentMethod } from '../models';
import { Repository } from 'typeorm';

export class CustomerRepository {
	private customerRepo: Repository<Customer>;
	private addressRepo: Repository<Address>;
	private customerAddressRepo: Repository<CustomerAddress>;
	private paymentMethodRepo: Repository<PaymentMethod>;

	constructor() {
		this.customerRepo = AppDataSource.getRepository(Customer);
		this.addressRepo = AppDataSource.getRepository(Address);
		this.customerAddressRepo = AppDataSource.getRepository(CustomerAddress);
		this.paymentMethodRepo = AppDataSource.getRepository(PaymentMethod);
	}

	// Customer operations
	async createCustomer(data: Partial<Customer>): Promise<Customer> {
		const customer = this.customerRepo.create(data);
		return await this.customerRepo.save(customer);
	}

	async getCustomerById(customerId: number): Promise<Customer | null> {
		return await this.customerRepo.findOne({
			where: { customerId },
			relations: ['user']
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

	async getAddressById(addressId: number, customerId: number): Promise<CustomerAddress | null> {
		return await this.customerAddressRepo.findOne({
			where: { addressId, customerId },
			relations: ['address']
		});
	}

	async getCustomerAddress(addressId: number, customerId: number): Promise<CustomerAddress | null> {
		return await this.customerAddressRepo.findOne({
			where: { addressId, customerId }
		});
	}

	async updateAddress(addressId: number, data: Partial<Address>): Promise<Address | null> {
		await this.addressRepo.update(addressId, data);
		return await this.addressRepo.findOne({ where: { addressId } });
	}

	async deleteAddress(addressId: number): Promise<void> {
		await this.customerAddressRepo.delete({ addressId });
		await this.addressRepo.delete(addressId);
	}

	async linkAddressToCustomer(customerId: number, addressId: number, isDefault: boolean): Promise<void> {
		if (isDefault) {
			await this.customerAddressRepo.update({ customerId }, { isDefault: false });
		}
		const customerAddress = this.customerAddressRepo.create({ customerId, addressId, isDefault });
		await this.customerAddressRepo.save(customerAddress);
	}

	async getAllAddresses(customerId: number): Promise<any[]> {
		return await this.customerAddressRepo.find({
			where: { customerId },
			relations: ['address']
		});
	}

	async setDefaultAddress(customerId: number, addressId: number): Promise<void> {
		await this.customerAddressRepo.update({ customerId }, { isDefault: false });
		await this.customerAddressRepo.update({ customerId, addressId }, { isDefault: true });
	}

	// Payment method operations
	async getPaymentMethodById(paymentMethodId: number): Promise<PaymentMethod | null> {
		return await this.paymentMethodRepo.findOne({ where: { paymentMethodId } });
	}
}
