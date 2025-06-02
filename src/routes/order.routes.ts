import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { placeOrderBodySchema, cancelOrderSchema, orderIdSchema } from '../validators';

const OrderRouter = Router();
const controller = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

OrderRouter.post('/place', validateRequest({ body: placeOrderBodySchema }), controller.placeOrder.bind(controller));

/**
 * @swagger
 * /orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
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

OrderRouter.post(
	'/:orderId/cancel',
	validateRequest({
		params: orderIdSchema,
		body: cancelOrderSchema
	}),
	controller.cancelOrder.bind(controller)
);

///orders/:orderId/summary
OrderRouter.get('/:orderId/summary', controller.getOrderSummary.bind(controller));

///orders/summary
OrderRouter.get('/summary', controller.getOrdersSummary.bind(controller));

///orders/:orderId/cancel-by-restaurant
OrderRouter.post('/:orderId/cancel-by-restaurant', controller.cancelByRestaurant.bind(controller));

export default OrderRouter;
