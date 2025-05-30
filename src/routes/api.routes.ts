import { Router } from 'express';
import AppRouter from './app.routes';
import UserRouter from './user.routes';
import CartRouter from './cart.routes';

const ApiRouter = Router();

ApiRouter.use('/app', AppRouter);
ApiRouter.use('/user', UserRouter);
ApiRouter.use('/cart', CartRouter);

export default ApiRouter;
