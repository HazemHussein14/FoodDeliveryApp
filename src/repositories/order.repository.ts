import { AppDataSource } from '../config/data-source';
import { Order, OrderItem, OrderStatus } from '../models';
import { Repository } from 'typeorm';

interface GetOrdersOptions {
	page: number;
	limit: number;
	status?: string;
	startDate?: Date;
	endDate?: Date;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

interface CancelOrderData {
	reason: string;
	cancelledBy: string;
	cancelledAt: Date;
}

export class OrderRepository {
	private orderRepo: Repository<Order>;
	private orderItemRepo: Repository<OrderItem>;
	private orderStatusRepo: Repository<OrderStatus>;

	constructor() {
		this.orderRepo = AppDataSource.getRepository(Order);
		this.orderItemRepo = AppDataSource.getRepository(OrderItem);
		this.orderStatusRepo = AppDataSource.getRepository(OrderStatus);
	}

	async createOrder(order: Order): Promise<Order> {
		return await this.orderRepo.save(order);
	}

	async createOrderItems(orderItems: OrderItem[]): Promise<OrderItem[]> {
		return await this.orderItemRepo.save(orderItems);
	}

	async getOrders(options: GetOrdersOptions): Promise<{ orders: Order[]; total: number }> {
		const { page, limit, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
		const skip = (page - 1) * limit;

		const queryBuilder = this.orderRepo
			.createQueryBuilder('order')
			.leftJoinAndSelect('order.items', 'items')
			.leftJoinAndSelect('order.orderStatus', 'status');

		if (status) {
			queryBuilder.andWhere('status.statusName = :status', { status });
		}

		if (startDate && endDate) {
			queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
				startDate,
				endDate
			});
		}

		const [orders, total] = await queryBuilder
			.orderBy(`order.${sortBy}`, sortOrder)
			.skip(skip)
			.take(limit)
			.getManyAndCount();

		return { orders, total };
	}

	async getOrderById(orderId: number): Promise<Order | null> {
		return await this.orderRepo.findOne({
			where: { orderId },
			relations: ['orderStatus', 'restaurant', 'deliveryAddress', 'items', 'items.menuItem.item']
		});
	}

	async getAllOrdersByCustomerId(customerId: number): Promise<Order[]> {
		return await this.orderRepo.find({
			where: { customerId }
		});
	}

	async getOrderByCustomerId(orderId: number, customerId: number): Promise<Order | null> {
		return await this.orderRepo.findOne({
			where: { customerId, orderId },
			relations: ['orderStatus']
		});
	}

	async getAllOrdersByRestaurantId(restaurantId: number): Promise<Order[]> {
		return await this.orderRepo.find({
			where: { restaurantId }
		});
	}

	async getOrderByRestaurantId(orderId: number, restaurantId: number): Promise<Order | null> {
		return await this.orderRepo.findOne({
			where: { restaurantId, orderId }
		});
	}

	async updateOrder(orderId: number, data: Partial<Order>): Promise<Order | null> {
		await this.orderRepo.update(orderId, data);
		return await this.getOrderById(orderId);
	}

	async updateOrderStatus(orderId: number, orderStatusId: number): Promise<Order | null> {
		const order = await this.getOrderById(orderId);
		if (!order) {
			return null;
		}

		order.orderStatusId = orderStatusId;
		return await this.orderRepo.save(order);
	}

	async cancelOrder(orderId: number, cancelData: CancelOrderData): Promise<Order | null> {
		const order = await this.getOrderById(orderId);
		if (!order) {
			return null;
		}

		order.cancellationInfo = {
			reason: cancelData.reason,
			cancelledBy: cancelData.cancelledBy,
			cancelledAt: cancelData.cancelledAt
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

	async getOrderItemById(orderItemId: number): Promise<OrderItem | null> {
		return await this.orderItemRepo.findOne({
			where: { orderItemId },
			relations: ['item']
		});
	}

	async getOrderItemByOrderId(orderId: number, orderItemId: number) {
		return this.orderItemRepo.findOne({
			where: { orderId, orderItemId }
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

	async getOrderStatusByName(statusName: string): Promise<OrderStatus | null> {
		return await this.orderStatusRepo.findOne({
			where: { statusName }
		});
	}

	async hasActiveOrdersForMenu(menuId: number): Promise<boolean> {
		const count = await this.orderRepo
			.createQueryBuilder('order')
			.innerJoin('order.items', 'orderItem')
			.innerJoin('orderItem.menuItem', 'menuItem')
			.innerJoin('order.orderStatus', 'orderStatus')
			.where('menuItem.menuId = :menuId', { menuId })
			.andWhere('orderStatus.statusName IN (:...activeStatuses)', {
				activeStatuses: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery']
			})
			.getCount();

		return count > 0;
	}
}
