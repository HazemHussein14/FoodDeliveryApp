import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post('/place', controller.placeOrder.bind(controller));

export default OrderRouter;
