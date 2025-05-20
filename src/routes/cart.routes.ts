import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createCartBodySchema } from '../validators/cart.validator';

const CartRouter = Router();
const controller = new CartController();


export default CartRouter;