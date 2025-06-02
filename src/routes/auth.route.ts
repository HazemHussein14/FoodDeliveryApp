import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const AuthRouter = Router();
const controller = new AuthController();

AuthRouter.post('/login', validateRequest({ body: loginSchema }), controller.login.bind(controller));
AuthRouter.post('/register', validateRequest({ body: registerSchema }), controller.register.bind(controller));

export default AuthRouter;
