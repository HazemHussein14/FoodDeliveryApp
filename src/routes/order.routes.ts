import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { placeOrderBodySchema, 
  updateOrderStatusBodySchema, 
  updateOrderStatusParamsSchema, 
  cancelOrderByCustomerBodySchema, 
  cancelOrderByCustomerParamsSchema } from '../validators/order.validator';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post('/place', validateRequest({ body: placeOrderBodySchema }), controller.placeOrder.bind(controller));
OrderRouter.put('/:orderId/status', validateRequest({ body: updateOrderStatusBodySchema, params: updateOrderStatusParamsSchema }), controller.updateOrderStatus.bind(controller));
OrderRouter.put('/:orderId/cancel-by-customer', validateRequest({ body: cancelOrderByCustomerBodySchema, params: cancelOrderByCustomerParamsSchema }), controller.cancelOrderByCustomer.bind(controller));

export default OrderRouter;
