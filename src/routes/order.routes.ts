import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { placeOrderBodySchema } from '../validators/order.validator';
import { 
    createOrderSchema, 
    updateOrderStatusSchema, 
    cancelOrderSchema, 
    orderQuerySchema, 
    orderIdSchema 
} from '../schemas/order.schema';

const OrderRouter = Router();
const controller = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
OrderRouter.post('/', 
    isAuthenticated,
    validateRequest({ body: createOrderSchema }), 
    controller.createOrder.bind(controller)
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, delivering, delivered, cancelled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
OrderRouter.get('/',
    isAuthenticated,
    validateRequest({ query: orderQuerySchema }),
    controller.getOrders.bind(controller)
);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
OrderRouter.get('/:orderId',
    isAuthenticated,
    validateRequest({ params: orderIdSchema }),
    controller.getOrderById.bind(controller)
);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
OrderRouter.patch('/:orderId/status',
    isAuthenticated,
    validateRequest({ 
        params: orderIdSchema,
        body: updateOrderStatusSchema 
    }),
    controller.updateOrderStatus.bind(controller)
);

/**
 * @swagger
 * /orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrderRequest'
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
OrderRouter.post('/:orderId/cancel',
    isAuthenticated,
    validateRequest({ 
        params: orderIdSchema,
        body: cancelOrderSchema 
    }),
    controller.cancelOrder.bind(controller)
);

///orders/:orderId/summary
OrderRouter.get('/:orderId/summary', isAuthenticated, controller.getOrderSummary.bind(controller));

///orders/summary
OrderRouter.get('/summary', isAuthenticated, controller.getOrdersSummary.bind(controller));

///orders/:orderId/cancel-by-restaurant
OrderRouter.post('/:orderId/cancel-by-restaurant', isAuthenticated,
  controller.CancelbyRestaurant.bind(controller));

export default OrderRouter;