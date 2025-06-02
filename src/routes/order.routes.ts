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

///orders/:orderId/summary
OrderRouter.get('/:orderId/summary', controller.getOrderSummary.bind(controller));

///orders/summary
OrderRouter.get('/summary', controller.getOrdersSummary.bind(controller));

///orders/:orderId/cancel-by-restaurant
OrderRouter.post('/:orderId/cancel-by-restaurant', controller.cancelOrderByRestaurant.bind(controller));

export default OrderRouter;
