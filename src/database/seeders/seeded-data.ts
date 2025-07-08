import {
	Address,
	Cart,
	CartItem,
	Customer,
	CustomerAddress,
	Item,
	Menu,
	MenuItem,
	Order,
	OrderItem,
	OrderStatus,
	PaymentMethod,
	TransactionStatus,
	Restaurant,
	RestaurantSetting,
	Role,
	User,
	UserRole,
	UserType
} from '../../models';
import { SeedData } from '.';
import { faker } from '@faker-js/faker';

// * Users
const userTypesData: SeedData<UserType> = {
	entity: UserType,
	data: [
		{
			name: 'customer'
		},
		{
			name: 'restaurant'
		},
		{
			name: 'admin'
		},
		{
			name: 'editor'
		}
	]
};

const usersData: SeedData<User> = {
	entity: User,
	data: Array.from({ length: 87000 }).map((u, index) => {
		// Distribution:
		// 0-79999: customers (80,000 users)
		// 80000-84999: restaurants (5,000 users)
		// 85000-86499: admins (1,500 users)
		// 86500-86999: editors (500 users)

		let userTypeId = 1; // default customer
		if (index >= 80000 && index < 85000)
			userTypeId = 2; // restaurants
		else if (index >= 85000 && index < 86500)
			userTypeId = 3; // admins
		else if (index >= 86500) userTypeId = 4; // editors

		// Generate unique phone number using index
		const phoneNumber = `+1${String(index + 1000000000).slice(1)}`; // ensures 10-digit unique numbers

		return {
			name: userTypeId === 2 ? faker.company.name() : faker.person.fullName(), // company names for restaurants
			email: `user${index + 1}@${faker.internet.domainName()}`, // ensure unique emails
			password: 'hashpassword',
			phone: phoneNumber,
			isActive: faker.datatype.boolean(0.95), // 95% active users
			userTypeId
		};
	})
};

const roleSeedData: SeedData<Role> = {
	entity: Role,
	data: ['customer', 'admin', 'driver', 'staff', 'editor'].map((role, i) => ({
		name: role.toLowerCase()
	}))
};

const userRoleSeedData: SeedData<UserRole> = {
	entity: UserRole,
	data: Array.from({ length: 86999 }).map((_, index) => {
		// Ensure unique (userId, roleId) combinations
		// Distribute roles evenly to avoid duplicates
		const userId = index + 1; // map to users 1-86999
		const roleId = (index % 5) + 1; // cycle through roles 1-5 to ensure uniqueness

		return {
			userId,
			roleId
		};
	})
};

const addressSeedData: SeedData<Address> = {
	entity: Address,
	data: Array.from({ length: 150000 }).map(() => ({
		addressLine1: faker.location.streetAddress(),
		addressLine2: faker.location.secondaryAddress(),
		city: faker.location.city()
	}))
};

const customerSeedData: SeedData<Customer> = {
	entity: Customer,
	data: Array.from({ length: 80000 }).map((_, index) => ({
		userId: index + 1, // map to first 80,000 users (customers)
		birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
		gender: faker.helpers.arrayElement(['male', 'female'])
	}))
};

const customerAddressSeedData: SeedData<CustomerAddress> = {
	entity: CustomerAddress,
	data: Array.from({ length: 120000 }).map((_, index) => {
		// Ensure unique (addressId, customerId) combinations
		// Give each customer 1-2 addresses on average
		const customerId = Math.floor(index / 1.5) + 1; // customers get 1-2 addresses
		const addressOffset = index % 2; // alternate between first and second address for each customer
		const addressId = ((customerId * 2 + addressOffset - 1) % 150000) + 1; // ensure unique combinations
		const isDefault = addressOffset === 0; // first address is default

		return {
			customerId: Math.min(customerId, 80000), // ensure we don't exceed customer count
			addressId,
			isDefault
		};
	})
};

// * Restaurant Settings

const restaurantSettingSeedData: SeedData<RestaurantSetting> = {
	entity: RestaurantSetting,
	data: Array.from({ length: 5000 }).map((_, index) => ({
		serviceFeePercentage: parseFloat(faker.number.float({ min: 1, max: 10, fractionDigits: 2 }).toFixed(2)),
		deliveryFeePercentage: parseFloat(faker.number.float({ min: 5, max: 15, fractionDigits: 2 }).toFixed(2))
	}))
};

const restaurantSeedData: SeedData<Restaurant> = {
	entity: Restaurant,
	data: Array.from({ length: 5000 }).map((_, index) => ({
		userId: index + 80001, // map to users 80001-85000 (restaurant users)
		restaurantSettingId: index + 1, // Link to restaurant setting (1:1)
		name: faker.company.name(),
		logoUrl: faker.image.url(),
		bannerUrl: faker.image.url(),
		location: {
			type: 'Point',
			coordinates: [parseFloat(faker.location.longitude().toString()), parseFloat(faker.location.latitude().toString())]
		},
		status: faker.helpers.arrayElement(['open', 'busy', 'pause', 'closed']),
		commercialRegistrationNumber: `CR${String(index + 10000000).slice(1)}`, // ensure unique commercial registration
		vatNumber: `VAT${String(index + 100000000).slice(1)}`, // ensure unique VAT numbers
		isActive: faker.datatype.boolean(0.9) // 90% active restaurants
	}))
};

const menuSeedData: SeedData<Menu> = {
	entity: Menu,
	data: Array.from({ length: 5000 }).map((_, index) => ({
		restaurantId: index + 1, // Link to restaurant (1:1 relationship)
		menuTitle: faker.commerce.department(),
		isActive: faker.datatype.boolean(0.9) // 90% active menus
	}))
};

const itemSeedData: SeedData<Item> = {
	entity: Item,
	data: Array.from({ length: 50000 }).map((_, index) => ({
		restaurantId: Math.floor(index / 10) + 1, // 10 items per restaurant (50000/5000)
		imagePath: faker.image.url(),
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		price: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
		energyValCal: parseFloat(faker.number.float({ min: 50, max: 500 }).toFixed(2)),
		notes: faker.lorem.sentence(),
		isAvailable: faker.datatype.boolean(0.85) // 85% available items
	}))
};

const menuItemSeedData: SeedData<MenuItem> = {
	entity: MenuItem,
	data: Array.from({ length: 50000 }).map((_, index) => {
		// Ensure unique (menuId, itemId) combinations
		// Each item belongs to exactly one menu (1:1 item-to-menu relationship)
		const itemId = index + 1;
		const restaurantId = Math.floor(index / 10) + 1; // which restaurant this item belongs to
		const menuId = restaurantId; // menu matches restaurant (1:1)

		return {
			menuId,
			itemId
		};
	})
};

const paymentMethodSeedData: SeedData<PaymentMethod> = {
	entity: PaymentMethod,
	data: Array.from({ length: 4 }).map((_, i) => ({
		methodName: ['credit_card', 'debit_card', 'cash_on_delivery', 'digital_wallet'][i],
		description: faker.lorem.sentence(),
		iconUrl: faker.image.url({ width: 50, height: 50 }),
		order: i,
		isActive: true
	}))
};

// Seed data for PaymentStatus
const transactionStatusSeedData: SeedData<TransactionStatus> = {
	entity: TransactionStatus,
	data: [
		{ status: 'pending', isActive: true },
		{ status: 'paid', isActive: true },
		{ status: 'failed', isActive: true },
		{ status: 'refunded', isActive: true }
	]
};

// Order Status seed data
const orderStatusSeedData: SeedData<OrderStatus> = {
	entity: OrderStatus,
	data: [
		{ statusName: 'pending' },
		{ statusName: 'confirmed' },
		{ statusName: 'preparing' },
		{ statusName: 'ready_for_pickup' },
		{ statusName: 'out_for_delivery' },
		{ statusName: 'delivered' },
		{ statusName: 'cancelled' },
		{ statusName: 'refunded' }
	]
};

// Cart seed data
const cartSeedData: SeedData<Cart> = {
	entity: Cart,
	data: Array.from({ length: 40000 }).map((_, index) => ({
		customerId: (index % 80000) + 1 // 50% of customers have active carts
	}))
};

// CartItem seed data
const cartItemSeedData: SeedData<CartItem> = {
	entity: CartItem,
	data: Array.from({ length: 120000 }).map((_, index) => {
		// Ensure unique (cartId, itemId) combinations
		const cartId = Math.floor(index / 3) + 1; // 3 items per cart on average
		const itemOffset = index % 3; // 3 different items per cart
		const baseItemId = ((cartId * 3 + itemOffset) % 50000) + 1; // ensure unique combinations
		const itemId = baseItemId;
		const restaurantId = Math.floor((itemId - 1) / 10) + 1; // items belong to restaurants
		const quantity = faker.number.int({ min: 1, max: 5 });
		const price = parseFloat(faker.commerce.price({ min: 5, max: 50 }));
		const totalPrice = Number((quantity * price).toFixed(2));

		return {
			cartId: Math.min(cartId, 40000), // ensure we don't exceed cart count
			restaurantId,
			itemId,
			quantity,
			price,
			totalPrice
		};
	})
};

// Order seed data (1,000,000 orders)
const orderSeedData: SeedData<Order> = {
	entity: Order,
	data: Array.from({ length: 1000000 }).map((_, index) => {
		const customerId = (index % 80000) + 1; // distribute across all customers (~12.5 orders per customer)
		const orderStatusId = faker.number.int({ min: 1, max: 8 }); // random order status
		const restaurantId = (index % 5000) + 1; // distribute across restaurants
		const addressId = (index % 150000) + 1; // use available addresses

		const totalItems = faker.number.int({ min: 1, max: 6 });
		const totalItemsAmount = parseFloat(faker.commerce.price({ min: 15, max: 250 }));
		const deliveryFees = parseFloat(faker.commerce.price({ min: 2, max: 12 }));
		const serviceFees = parseFloat(faker.commerce.price({ min: 1, max: 8 }));
		const discount = parseFloat(faker.commerce.price({ min: 0, max: 20 }));
		const totalAmount = Number((totalItemsAmount + deliveryFees + serviceFees - discount).toFixed(2));

		return {
			orderStatusId,
			restaurantId,
			customerId,
			deliveryAddressId: addressId,
			customerInstructions: faker.helpers.arrayElement([
				'Please ring the doorbell',
				'Leave at the door',
				'Call when you arrive',
				'',
				'Extra napkins please',
				'Contactless delivery',
				'Ring twice',
				'Apartment buzzer broken',
				'Meet me at lobby'
			]),
			totalItems,
			totalItemsAmount,
			deliveryFees,
			serviceFees,
			discount,
			totalAmount,
			placedAt: faker.date.recent({ days: 180 }), // orders from last 6 months
			deliveredAt: orderStatusId === 6 ? faker.date.recent({ days: 90 }) : null, // only delivered orders have deliveredAt
			cancellationInfo:
				orderStatusId === 7
					? { reason: faker.helpers.arrayElement(['Customer cancelled', 'Restaurant unavailable', 'Payment failed']) }
					: {}
		};
	})
};

// OrderItem seed data (3,000,000 order items)
const orderItemSeedData: SeedData<OrderItem> = {
	entity: OrderItem,
	data: Array.from({ length: 3000000 }).map((_, index) => {
		const orderId = Math.floor(index / 3) + 1; // 3 items per order on average
		const menuItemId = (index % 50000) + 1; // use existing menu items (1-50000)
		const quantity = faker.number.int({ min: 1, max: 4 });
		const itemPrice = parseFloat(faker.commerce.price({ min: 5, max: 35 }));
		const totalPrice = Number((quantity * itemPrice).toFixed(2));

		return {
			orderId: Math.min(orderId, 1000000), // ensure we don't exceed order count
			menuItemId,
			quantity,
			itemPrice,
			totalPrice
		};
	})
};

const seedData = [
	// users - 87,000 users total (80k customers, 5k restaurants, 2k staff)
	userTypesData, // 4 records (added restaurant type)
	roleSeedData, // 5 records
	usersData, // 87,000 records
	customerSeedData, // 80,000 records
	addressSeedData, // 150,000 records
	customerAddressSeedData, // 120,000 records
	userRoleSeedData, // 86,999 records

	// restaurant and menu - 5,000 restaurants, 50,000 items
	restaurantSettingSeedData, // 5,000 records
	restaurantSeedData, // 5,000 records
	menuSeedData, // 5,000 records
	itemSeedData, // 50,000 records
	menuItemSeedData, // 50,000 records

	// payment methods - static
	paymentMethodSeedData, // 4 records
	transactionStatusSeedData, // 4 records

	// order related - 1,000,000 orders, 3,000,000 order items (TIER 3)
	orderStatusSeedData, // 8 records
	cartSeedData, // 40,000 records
	cartItemSeedData, // 120,000 records
	orderSeedData, // 1,000,000 records
	orderItemSeedData // 3,000,000 records
];

export default seedData;
