import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { getOrderDetailsParamsSchema, placeOrderBodySchema } from '../validators/order.validator';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post('/place', validateRequest({ body: placeOrderBodySchema }), controller.placeOrder.bind(controller));
// Route to get a customer's specific order by orderId
OrderRouter.get(
  '/customer/:orderId',
  validateRequest({ params: getOrderDetailsParamsSchema }), // Validate orderId param
  isAuthenticated, // Ensure user is authenticated
  controller.viewCustomerOrderDetails.bind(controller)
);

export default OrderRouter;
