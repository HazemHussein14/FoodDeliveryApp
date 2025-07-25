import { CustomerRepository, OrderRepository, UserRepository } from '../repositories';
import { StatusCodes } from 'http-status-codes';
import { ErrMessages, ApplicationError } from '../errors';
import { Transactional } from 'typeorm-transactional';
import { ViewOrderStatusResponseDto, OrderHistoryDto, AddAddressDto, AddressDto, UpdateAddressDto } from '../dto/customer.dto';
import { AppDataSource } from '../config/data-source';

export class CustomerService {
	private customerRepo = new CustomerRepository();
	private orderRepo = new OrderRepository();
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

	@Transactional()
	async deactivateCustomer(customerId: number) {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		if (customer.user.isActive) {
			throw new ApplicationError(ErrMessages.customer.CustomerIsNotActive, StatusCodes.BAD_REQUEST);
		}
		await this.userRepo.updateUser(customer.userId, { isActive: customer.user.isActive });
	}

	@Transactional()
	async getCustomerOrderStatus(customerId: number, orderId: number): Promise<ViewOrderStatusResponseDto> {
		const results = await AppDataSource.query(
			`
			SELECT 
				cst.customer_id AS "customerId",
				ord.order_id AS "orderId",
				ord.updated_at AS "updatedAt",
				ord.delivered_at AS "deliveredAt",
				status.order_status_id AS "statusId",
				status.status_name AS "statusName"
			FROM customer cst
			JOIN order ord ON cst.customer_id = ord.customer_id
			JOIN order_status status ON ord.order_status_id = status.order_status_id
			WHERE cst.customer_id = ? AND ord.order_id = ?`,
			[customerId, orderId]
		);

		if (results.length === 0) {
			throw new ApplicationError(ErrMessages.order.OrderItemNotFound);
		}

		const result = results[0];

		return {
			orderId: result.orderId,
			status: {
				id: result.statusId,
				name: result.statusName
			},
			updatedAt: result.updatedAt,
			deliveredAt: result.deliveredAt
		};
	}

	@Transactional()
	async submitOrderFeedback(customerId: number, orderId: number, rating: number | undefined, comment: string | undefined) {
		if (rating === undefined && comment === undefined) {
			throw new ApplicationError(ErrMessages.customer.OrderFeedbackMustnotBeEmpty, StatusCodes.BAD_REQUEST);
		}

		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const order = await this.orderRepo.getOrderByCustomerId(orderId, customerId);
		if (!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.FORBIDDEN);
		}

		await this.orderRepo.updateOrder(orderId, { customerRating: rating, customerComment: comment });
	}

	@Transactional()
	async getOrderHistory(customerId: number): Promise<OrderHistoryDto[]> {
		const results = await AppDataSource.query(
			`
			SELECT
				o.order_id AS "orderId",
				os.status_name AS "orderStatus",
				r.name AS "restaurantName",
				a.address_line1 || ', ' || a.city AS "deliveryAddress",
				o.total_amount AS "totalAmount",
				o.placed_at AS "placedAt",
				o.delivered_at AS "deliveredAt",
				pm.method_name AS "paymentMethod",
				o.customer_rating AS "customerRating",
				o.customer_comment AS "customerComment",
				json_agg(
					json_build_object(
						'name', i.name,
						'quantity', oi.quantity,
						'price', oi.item_price
					)
				) AS items
			FROM "order" o
			JOIN order_status os ON o.order_status_id = os.order_status_id
			JOIN restaurant r ON o.restaurant_id = r.restaurant_id
			JOIN address a ON o.delivery_address_id = a.address_id
			JOIN transaction t ON o.order_id = t.order_id
			JOIN payment_method pm ON t.payment_method_id = pm.payment_method_id
			JOIN order_item oi ON o.order_id = oi.order_id
			JOIN menu_item mi ON oi.menu_item_id = mi.menu_item_id
			JOIN item i ON i.item_id = mi.item_id
			WHERE o.customer_id = 2
			GROUP BY 
				o.order_id,
				os.status_name,
				r.name,
				a.address_line1,
				a.city,
				pm.method_name,
				o.total_amount,
				o.placed_at,
				o.delivered_at,
				o.customer_rating,
				o.customer_comment
		`,
			[customerId]
		);

		return results.map(
			(row: any): OrderHistoryDto => ({
				orderId: row.orderId,
				orderStatus: row.orderStatus,
				restaurantName: row.restaurantName,
				deliveryAddress: row.deliveryAddress,
				totalAmount: Number(row.totalAmount),
				placedAt: new Date(row.placedAt),
				deliveredAt: row.deliveredAt ? new Date(row.deliveredAt) : null,
				paymentMethod: row.paymentMethod,
				customerRating: row.customerRating !== null ? Number(row.customerRating) : null,
				customerComment: row.customerComment ?? null,
				items: Array.isArray(row.items)
					? row.items.map((item: any) => ({
							name: item.name,
							quantity: item.quantity,
							price: item.price
						}))
					: []
			})
		);
	}

	@Transactional()
	async addAddress(customerId: number, addressDto: AddAddressDto): Promise<AddressDto> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const address = await this.customerRepo.addAddress(addressDto);
		await this.customerRepo.linkAddressToCustomer(customerId, address.addressId, addressDto.isDefault);

		return { ...address, isDefault: addressDto.isDefault };
	}

	@Transactional()
	async updateAddress(customerId: number, addressId: number, addressDto: UpdateAddressDto): Promise<AddressDto> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const address = await this.customerRepo.getAddressById(addressId, customerId);
		if (!address) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, StatusCodes.NOT_FOUND);
		}

		const updatedAddress = await this.customerRepo.updateAddress(addressId, { 
			addressLine1: addressDto.addressLine1, 
			addressLine2: addressDto.addressLine2,
			city: addressDto.city });

		if (!updatedAddress) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, StatusCodes.NOT_FOUND);
		}

		if (addressDto.isDefault === true) {
			await this.customerRepo.setDefaultAddress(customerId, addressId);
		}

		const customerAddress = await this.customerRepo.getCustomerAddress(addressId, customerId);

		return {
			addressId: updatedAddress.addressId,
			addressLine1: updatedAddress.addressLine1,
			addressLine2: updatedAddress.addressLine2,
			city: updatedAddress.city,
			isDefault: customerAddress?.isDefault || false
		};
	}

	@Transactional()
	async deleteAddress(customerId: number, addressId: number): Promise<void> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const address = await this.customerRepo.getAddressById(addressId, customerId);
		if (!address) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, StatusCodes.NOT_FOUND);
		}

		await this.customerRepo.deleteAddress(addressId);
	}

	@Transactional()
	async getAddress(customerId: number, addressId: number): Promise<AddressDto> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const customerAddress = await this.customerRepo.getAddressById(addressId, customerId);
		if (!customerAddress) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, StatusCodes.NOT_FOUND);
		}

		return {
			addressId: customerAddress.address.addressId,
			addressLine1: customerAddress.address.addressLine1,
			addressLine2: customerAddress.address.addressLine2,
			city: customerAddress.address.city,
			isDefault: customerAddress.isDefault
		};
	}

	@Transactional()
	async getAllAddresses(customerId: number): Promise<AddressDto[]> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const addresses = await this.customerRepo.getAllAddresses(customerId);
		return addresses.map((address) => ({
			addressId: address.address.addressId,
			addressLine1: address.address.addressLine1,
			addressLine2: address.address.addressLine2,
			city: address.address.city,
			isDefault: address.isDefault
		}));
	}

	@Transactional()
	async setDefaultAddress(customerId: number, addressId: number): Promise<void> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const address = await this.customerRepo.getAddressById(addressId, customerId);
		if (!address) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, StatusCodes.NOT_FOUND);
		}

		await this.customerRepo.setDefaultAddress(customerId, addressId);
	}

	@Transactional()
	async setPreferredPaymentMethod(customerId: number, paymentMethodId: number): Promise<void> {
		const customer = await this.customerRepo.getCustomerById(customerId);
		if (!customer) {
			throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		}

		const paymentMethod = await this.customerRepo.getPaymentMethodById(paymentMethodId);
		if (!paymentMethod) {
			throw new ApplicationError(ErrMessages.payment.PaymentMethodNotFound, StatusCodes.NOT_FOUND);
		}

		await this.customerRepo.updateCustomer(customerId, { preferredPaymentMethodId: paymentMethodId });
	}
}
