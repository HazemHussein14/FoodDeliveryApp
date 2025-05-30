import { AppDataSource } from '../config/data-source';
import { Order, OrderItem, OrderStatus } from '../models';
import { Repository } from 'typeorm';

export class OrderRepository {
	private orderRepo: Repository<Order>;
	private orderItemRepo: Repository<OrderItem>;
	private orderStatusRepo: Repository<OrderStatus>;

	constructor() {
		this.orderRepo = AppDataSource.getRepository(Order);
		this.orderItemRepo = AppDataSource.getRepository(OrderItem);
		this.orderStatusRepo = AppDataSource.getRepository(OrderStatus);
	}

	// Order operations
	async createOrder(data: Partial<Order>): Promise<Order> {
		const order = this.orderRepo.create(data);
		return await this.orderRepo.save(order);
	}

	async getOrderById(orderId: number): Promise<Order | null> {
		return await this.orderRepo.findOne({
			where: { orderId },
			relations: ['orderStatus', 'branch', 'cart', 'customer', 'deliveryAddress']
		});
	}

	async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
		return await this.orderRepo.find({
			where: { customerId },
			relations: ['orderStatus', 'branch', 'cart', 'customer', 'deliveryAddress'],
			order: { createdAt: 'DESC' }
		});
	}

	async updateOrder(orderId: number, data: Partial<Order>): Promise<Order | null> {
		await this.orderRepo.update(orderId, data);
		return await this.getOrderById(orderId);
	}

	async updateOrderStatus(orderId: number, orderStatusId: number): Promise<Order | null> {
		await this.orderRepo.update(orderId, { orderStatusId });
		return await this.getOrderById(orderId);
	}

	async cancelOrder(
		orderId: number,
		cancelledBy: 'customer' | 'restaurant' | 'system' | 'driver',
		reason: string
	): Promise<Order | null> {
		const order = await this.getOrderById(orderId);
		if (!order) return null;

		order.cancellationInfo = {
			cancelledBy,
			reason,
			cancelledAt: new Date()
		};

		return await this.orderRepo.save(order);
	}

	// Order Item operations
	async addOrderItem(data: Partial<OrderItem>): Promise<OrderItem> {
		const orderItem = this.orderItemRepo.create(data);
		return await this.orderItemRepo.save(orderItem);
	}

	async getOrderItems(orderId: number): Promise<OrderItem[]> {
		return await this.orderItemRepo.find({
			where: { orderId },
			relations: ['item']
		});
	}

	async getOrderItem(orderItemId: number): Promise<OrderItem | null> {
		return await this.orderItemRepo.findOne({
			where: { orderItemId },
			relations: ['item']
		});
	}

	// Order Status operations
	async getAllOrderStatuses(): Promise<OrderStatus[]> {
		return await this.orderStatusRepo.find();
	}

	async getOrderStatusById(orderStatusId: number): Promise<OrderStatus | null> {
		return await this.orderStatusRepo.findOne({
			where: { orderStatusId }
		});
	}

	// Helper methods
	async calculateOrderTotal(orderId: number): Promise<number> {
		const orderItems = await this.getOrderItems(orderId);
		return orderItems.reduce((total, item) => total + item.totalPrice, 0);
	}

	async updateOrderTotalItems(orderId: number): Promise<void> {
		const orderItems = await this.getOrderItems(orderId);
		const totalItems = orderItems.reduce((total, item) => total + item.quantity, 0);
		await this.updateOrder(orderId, { totalItems });
	}
}
