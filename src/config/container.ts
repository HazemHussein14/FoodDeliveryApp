import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Import repositories
import { OrderRepository } from '../repositories/order.repository';
import { UserRepository } from '../repositories/user.repository';
import { CartRepository } from '../repositories/cart.repository';
import { MenuRepository } from '../repositories/menu.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { PaymentRepository } from '../repositories/payment.repository';

// Import services
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';
import { CartService } from '../services/cart.service';
import { MenuService } from '../services/menu.service';
import { CustomerService } from '../services/customer.service';
import { RestaurantService } from '../services/restaurant.service';
import { SettingService } from '../services/setting.service';
import { AuthService } from '../services/auth.service';
import { PaymentService } from '../services/payment.service';
import { RoleService } from '../services/role.service';
import { JwtService } from '../shared/jwt';
import { OtpService } from '../shared/otpService';
import { SmsService } from '../shared/smsService';

// Import controllers
import { OrderController } from '../controllers/order.controller';
import { UserController } from '../controllers/user.controller';
import { CartController } from '../controllers/cart.controller';
import { MenuController } from '../controllers/menu.controller';
import { CustomerController } from '../controllers/customer.controller';
import { SettingController } from '../controllers/setting.controller';
import { AuthController } from '../controllers/auth.controller';

const container = new Container();

// Bind repositories
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<CartRepository>(TYPES.CartRepository).to(CartRepository);
container.bind<MenuRepository>(TYPES.MenuRepository).to(MenuRepository);
container.bind<CustomerRepository>(TYPES.CustomerRepository).to(CustomerRepository);
container.bind<RestaurantRepository>(TYPES.RestaurantRepository).to(RestaurantRepository);
container.bind<SettingRepository>(TYPES.SettingRepository).to(SettingRepository);
container.bind<PaymentRepository>(TYPES.PaymentRepository).to(PaymentRepository);
container.bind<OrderRepository>(TYPES.OrderRepository).to(OrderRepository);

// Bind services
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<CartService>(TYPES.CartService).to(CartService);
container.bind<MenuService>(TYPES.MenuService).to(MenuService);
container.bind<CustomerService>(TYPES.CustomerService).to(CustomerService);
container.bind<RestaurantService>(TYPES.RestaurantService).to(RestaurantService);
container.bind<SettingService>(TYPES.SettingService).to(SettingService);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<PaymentService>(TYPES.PaymentService).to(PaymentService);
container.bind<OrderService>(TYPES.OrderService).to(OrderService);
container.bind<RoleService>(TYPES.RoleService).to(RoleService);
container.bind<JwtService>(TYPES.JwtService).to(JwtService);
container.bind<OtpService>(TYPES.OtpService).to(OtpService);
container.bind<SmsService>(TYPES.SmsService).to(SmsService);

// Bind controllers
container.bind<OrderController>(TYPES.OrderController).to(OrderController);
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<CartController>(TYPES.CartController).to(CartController);
container.bind<MenuController>(TYPES.MenuController).to(MenuController);
container.bind<CustomerController>(TYPES.CustomerController).to(CustomerController);
container.bind<SettingController>(TYPES.SettingController).to(SettingController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

export { container };
