import { Router } from 'express';
import AppRouter from './app.routes';
import UserRouter from './user.routes';

const ApiRouter = Router();

ApiRouter.use('/app', AppRouter);
ApiRouter.use('/user', UserRouter);

export default ApiRouter;
