import { Customer } from '../models/customer/customer.entity';
import { Address } from '../models/customer/address.entity';
import { CustomerAddress } from '../models/customer/customer-address.entity';

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  password: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
  userId: number;
}

export interface ICustomerRepository {
  createCustomer(customerData: CreateCustomerData): Promise<Customer>;
  findCustomerById(customerId: number): Promise<Customer | null>;
  findCustomerByUserId(userId: number): Promise<Customer | null>;
  findCustomerByEmail(email: string): Promise<Customer | null>;
  updateCustomer(customerId: number, updateData: Partial<Customer>): Promise<Customer>;
  deleteCustomer(customerId: number): Promise<boolean>;
  findCustomersWithPagination(offset: number, limit: number): Promise<{ customers: Customer[]; total: number }>;
} 