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
	PaymentStatus,
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
			name: 'admin'
		},
		{
			name: 'editor'
		}
	]
};

const usersData: SeedData<User> = {
	entity: User,
	data: Array.from({ length: 100 }).map((u) => {
		return {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: 'hashpassword',
			phone: faker.phone.number(),
			isActive: faker.datatype.boolean(),
			userTypeId: 1
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
	data: Array.from({ length: 99 }).map((_, index) => ({
		userId: index + 1, // adjust range based on seeded users
		roleId: faker.number.int({ min: 1, max: 5 }) // based on roles seeded above
	}))
};

const addressSeedData: SeedData<Address> = {
	entity: Address,
	data: Array.from({ length: 10 }).map(() => ({
		addressLine1: faker.location.streetAddress(),
		addressLine2: faker.location.secondaryAddress(),
		city: faker.location.city()
	}))
};

const customerSeedData: SeedData<Customer> = {
	entity: Customer,
	data: Array.from({ length: 100 }).map((_, index) => ({
		userId: index + 1, // assuming userId starts from 1
		birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
		gender: faker.helpers.arrayElement(['male', 'female'])
	}))
};

// * Menu

const menuSeedData: SeedData<Menu> = {
	entity: Menu,
	data: Array.from({ length: 10 }).map((_, index) => ({
		restaurantId: index + 1, // Link to restaurant
		menuTitle: faker.commerce.department(),
		isActive: true
	}))
};

const itemSeedData: SeedData<Item> = {
	entity: Item,
	data: Array.from({ length: 20 }).map(() => ({
		imagePath: faker.image.url(),
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		price: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
		energyValCal: parseFloat(faker.number.float({ min: 50, max: 500 }).toFixed(2)),
		notes: faker.lorem.sentence(),
		isAvailable: faker.datatype.boolean()
	}))
};

// * Restaurant Settings

const restaurantSettingSeedData: SeedData<RestaurantSetting> = {
	entity: RestaurantSetting,
	data: Array.from({ length: 10 }).map((_, index) => ({
		serviceFeePercentage: parseFloat(faker.number.float({ min: 1, max: 10, fractionDigits: 2 }).toFixed(2)),
		deliveryFeePercentage: parseFloat(faker.number.float({ min: 5, max: 15, fractionDigits: 2 }).toFixed(2))
	}))
};

// * restaurants

const restaurantSeedData: SeedData<Restaurant> = {
	entity: Restaurant,
	data: Array.from({ length: 10 }).map((_, index) => ({
		userId: index + 1,
		restaurantSettingId: index + 1, // Link to restaurant setting
		name: faker.company.name(),
		logoUrl: faker.image.url(),
		bannerUrl: faker.image.url(),
		location: {
			type: 'Point',
			coordinates: [parseFloat(faker.location.longitude().toString()), parseFloat(faker.location.latitude().toString())]
		},
		status: faker.helpers.arrayElement(['open', 'busy', 'pause', 'closed']),
		commercialRegistrationNumber: faker.string.alphanumeric(10),
		vatNumber: faker.string.alphanumeric(12),
		isActive: faker.datatype.boolean()
	}))
};

const menuItemSeedData: SeedData<MenuItem> = {
	entity: MenuItem,
	data: Array.from({ length: 20 }).map((_, index) => ({
		menuId: 1,
		itemId: index + 1
	}))
};

// Seed data for PaymentMethod
const paymentMethodSeedData: SeedData<PaymentMethod> = {
	entity: PaymentMethod,
	data: Array.from({ length: 4 }).map((_, i) => ({
		methodName: faker.finance.transactionType() + `_${i}`,
		description: faker.lorem.sentence(),
		iconUrl: faker.image.url({ width: 50, height: 50 }),
		order: i,
		isActive: true
	}))
};

// Seed data for PaymentStatus
const paymentStatusSeedData: SeedData<PaymentStatus> = {
	entity: PaymentStatus,
	data: [
		{ statusName: 'pending', isActive: true },
		{ statusName: 'paid', isActive: true },
		{ statusName: 'failed', isActive: true },
		{ statusName: 'refunded', isActive: true }
	]
};

// Add CustomerAddress seed data to connect customers with addresses
const customerAddressSeedData: SeedData<CustomerAddress> = {
	entity: CustomerAddress,
	data: Array.from({ length: 10 }).map((_, index) => ({
		customerId: index + 1,
		addressId: index + 1,
		isDefault: index < 5 // Make first 5 addresses default
	}))
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
	data: Array.from({ length: 20 }).map((_, index) => ({
		customerId: (index % 10) + 1 // Link to existing customers (1-10)
	}))
};

// CartItem seed data
const cartItemSeedData: SeedData<CartItem> = {
	entity: CartItem,
	data: Array.from({ length: 40 }).map((_, index) => {
		const cartId = Math.floor(index / 2) + 1; // Distribute items across carts
		const itemId = (index % 20) + 1; // Use existing items (1-20)
		const quantity = faker.number.int({ min: 1, max: 5 });
		const price = parseFloat(faker.commerce.price({ min: 5, max: 50 }));
		const totalPrice = Number((quantity * price).toFixed(2));

		return {
			cartId,
			restaurantId: (index % 10) + 1, // Link to existing restaurants (1-10)
			itemId,
			quantity,
			price,
			totalPrice
		};
	})
};

// Order seed data
const orderSeedData: SeedData<Order> = {
	entity: Order,
	data: Array.from({ length: 15 }).map((_, index) => {
		const customerId = (index % 10) + 1; // Link to existing customers (1-10)
		const cartId = index + 1; // Link to existing carts
		const orderStatusId = faker.number.int({ min: 1, max: 8 }); // Random order status
		const totalItems = faker.number.int({ min: 1, max: 5 });
		const totalItemsAmount = parseFloat(faker.commerce.price({ min: 20, max: 200 }));
		const deliveryFees = parseFloat(faker.commerce.price({ min: 2, max: 10 }));
		const serviceFees = parseFloat(faker.commerce.price({ min: 1, max: 5 }));
		const discount = parseFloat(faker.commerce.price({ min: 0, max: 15 }));
		const totalAmount = Number((totalItemsAmount + deliveryFees + serviceFees - discount).toFixed(2));

		return {
			orderStatusId,
			restaurantId: (index % 10) + 1, // Link to existing restaurants (1-10)
			cartId,
			customerId,
			deliveryAddressId: (index % 10) + 1, // Link to existing addresses (1-10)
			customerInstructions: faker.helpers.arrayElement([
				'Please ring the doorbell',
				'Leave at the door',
				'Call when you arrive',
				'',
				'Extra napkins please'
			]),
			totalItems,
			totalItemsAmount,
			deliveryFees,
			serviceFees,
			discount,
			totalAmount,
			placedAt: faker.date.recent({ days: 30 }),
			deliveredAt: faker.date.recent({ days: 15 }),
			cancellationInfo: {}
		};
	})
};

// OrderItem seed data
const orderItemSeedData: SeedData<OrderItem> = {
	entity: OrderItem,
	data: Array.from({ length: 30 }).map((_, index) => {
		const orderId = Math.floor(index / 2) + 1; // Distribute items across orders
		const menuItemId = (index % 20) + 1; // Use existing menu items (1-20)
		const quantity = faker.number.int({ min: 1, max: 3 });
		const itemPrice = parseFloat(faker.commerce.price({ min: 5, max: 30 }));
		const totalPrice = Number((quantity * itemPrice).toFixed(2));

		return {
			orderId,
			menuItemId,
			quantity,
			itemPrice,
			totalPrice
		};
	})
};



const seedData = [
	// users
	userTypesData,
	roleSeedData,
	usersData,
	customerSeedData,
	addressSeedData,
	customerAddressSeedData,
	userRoleSeedData,

	// restaurant and menu
	restaurantSettingSeedData,
	restaurantSeedData,
	menuSeedData,
	itemSeedData,
	menuItemSeedData,

	// payment methods
	paymentMethodSeedData,
	paymentStatusSeedData,

	// order related
	orderStatusSeedData,
	cartSeedData,
	cartItemSeedData,
	orderSeedData,
	orderItemSeedData
];

export default seedData;
