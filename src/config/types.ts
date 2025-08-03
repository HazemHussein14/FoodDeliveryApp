export const TYPES = {
	// Controllers
	OrderController: Symbol.for('OrderController'),
	UserController: Symbol.for('UserController'),
	CartController: Symbol.for('CartController'),
	MenuController: Symbol.for('MenuController'),
	CustomerController: Symbol.for('CustomerController'),
	RestaurantController: Symbol.for('RestaurantController'),
	SettingController: Symbol.for('SettingController'),
	AuthController: Symbol.for('AuthController'),

	// Services
	OrderService: Symbol.for('OrderService'),
	UserService: Symbol.for('UserService'),
	CartService: Symbol.for('CartService'),
	MenuService: Symbol.for('MenuService'),
	CustomerService: Symbol.for('CustomerService'),
	RestaurantService: Symbol.for('RestaurantService'),
	SettingService: Symbol.for('SettingService'),
	AuthService: Symbol.for('AuthService'),
	PaymentService: Symbol.for('PaymentService'),
	JwtService: Symbol.for('JwtService'),
	RoleService: Symbol.for('RoleService'),
	OtpService: Symbol.for('OtpService'),
	SmsService: Symbol.for('SmsService'),

	// Repositories
	OrderRepository: Symbol.for('OrderRepository'),
	UserRepository: Symbol.for('UserRepository'),
	CartRepository: Symbol.for('CartRepository'),
	MenuRepository: Symbol.for('MenuRepository'),
	CustomerRepository: Symbol.for('CustomerRepository'),
	RestaurantRepository: Symbol.for('RestaurantRepository'),
	SettingRepository: Symbol.for('SettingRepository'),
	PaymentRepository: Symbol.for('PaymentRepository'),
	RoleRepository: Symbol.for('RoleRepository')
};
