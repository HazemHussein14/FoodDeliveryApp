import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
	placeOrderBodySchema,
	updateOrderStatusBodySchema,
	updateOrderStatusParamsSchema,
	cancelOrderByCustomerBodySchema,
	cancelOrderByCustomerParamsSchema,
	getOrderDetailsParamsSchema
} from '../validators';

const OrderRouter = Router();
const controller = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

OrderRouter.post('/place', validateRequest({ body: placeOrderBodySchema }), controller.placeOrder.bind(controller));

// View customer's specific order
OrderRouter.get(
	'/customer/:orderId',
	validateRequest({ params: getOrderDetailsParamsSchema }), // Validate orderId param
	isAuthenticated, // Ensure user is authenticated
	controller.viewCustomerOrderDetails.bind(controller)
);

// View restaurant's specific order
OrderRouter.get(
	'/restaurant/:orderId',
	validateRequest({ params: getOrderDetailsParamsSchema }), // Validate orderId param
	isAuthenticated, // Ensure user is authenticated
	controller.viewRestaurantOrderDetails.bind(controller)
);

OrderRouter.put(
	'/:orderId/status',
	validateRequest({ body: updateOrderStatusBodySchema, params: updateOrderStatusParamsSchema }),
	controller.updateOrderStatus.bind(controller)
);

OrderRouter.put(
	'/:orderId/cancel-by-customer',
	validateRequest({ body: cancelOrderByCustomerBodySchema, params: cancelOrderByCustomerParamsSchema }),
	controller.cancelOrderByCustomer.bind(controller)
);

///orders/:orderId/summary
OrderRouter.get('/:orderId/summary', controller.getOrderSummary.bind(controller));

///orders/summary
OrderRouter.get('/summary', controller.getOrdersSummary.bind(controller));

///orders/:orderId/cancel-by-restaurant
OrderRouter.post('/:orderId/cancel-by-restaurant', controller.cancelOrderByRestaurant.bind(controller));
// View customer's order history
OrderRouter.get('/history/customer', isAuthenticated, controller.viewCustomerOrderHistory.bind(controller));

OrderRouter.get('/history/restaurant', isAuthenticated, controller.viewRestaurantOrderHistory.bind(controller));

export default OrderRouter;
