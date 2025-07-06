import { Router } from 'express';
import AppRouter from './app.routes';
import UserRouter from './user.routes';
import CartRouter from './cart.routes';
import OrderRouter from './order.routes';
import AuthRouter from './auth.route';
import RestaurantRouter from './restaurant.routes';

const ApiRouter = Router();

ApiRouter.use('/app', AppRouter);
ApiRouter.use('/user', UserRouter);
ApiRouter.use('/cart', CartRouter);
ApiRouter.use('/orders', OrderRouter);
ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/restaurants', RestaurantRouter);

export default ApiRouter;
