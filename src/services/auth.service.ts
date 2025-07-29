import { UserService } from './user.service';
import { config } from '../config/env';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '../shared/jwt';
import { StatusCodes } from 'http-status-codes';
import { Transactional } from 'typeorm-transactional';
import { CustomerService } from './customer.service';
import { Gender, UserType } from '../models';
import { OtpService } from '../shared/otpService';
import { SmsService } from '../shared/smsService';
import { RoleService } from './role.service';
import { LoginDto, RegisterCustomerDto, RegisterDto } from '../dto/auth.dto';
import { ApplicationError } from '../errors';

export class AuthService {
	private repo = new UserRepository();
	private jwtService = new JwtService();
	private userService = new UserService();
	private customerService = new CustomerService();
	private roleService: RoleService = new RoleService();

	// Handle user login
	async login(dto: LoginDto) {
		// Validate credentials and get full user with roles/types
		const user = await this.validateAndGetUser(dto);
		const userType = user.userType.name;

		// Determine actorId based on user type (e.g., customer vs restaurant)
		let actorId = userType === 'customer' ? user.customer.customerId : user.userId;

		const payload: AuthorizedUser = {
			userId: user.userId,
			roles: user.roles.map((role) => role.name),
			actorType: user.userType.name,
			actorId
		};

		let loginPayload = null;

		// Include restaurant ID if user is restaurant-related
		if (userType.includes('restaurant')) {
			loginPayload = {
				...payload,
				restaurantId: user.restaurant[0].restaurantId
			};
		} else {
			loginPayload = payload;
		}

		// Generate access and refresh tokens
		const tokens = this.generateTokens(loginPayload);

		return tokens;
	}

	// Generate access + refresh tokens
	generateTokens(payload: AuthorizedUser) {
		const token = this.jwtService.sign(payload);
		const refresh = this.jwtService.sign(payload, {
			expiresIn: config.jwt.refreshTTL
		});
		return { token, refresh };
	}

	// Validate credentials and return full user info without password
	async validateAndGetUser(dto: LoginDto) {
		const user = await this.userService.getOneOrFailBy({
			email: dto.email,
			withPassword: true,
			relations: ['roles', 'userType', 'customer', 'restaurant']
		});

		if (!user.isActive) {
			throw new ApplicationError('User is inactive', StatusCodes.UNAUTHORIZED);
		}

		const isPasswordValid = await this.userService.comparePasswords(dto.password, user.password);

		if (!isPasswordValid) {
			throw new ApplicationError('Invalid credentials', StatusCodes.UNAUTHORIZED);
		}

		const userWithOutPassword = { ...user, password: undefined };
		return userWithOutPassword;
	}

	// Register new customer and return access tokens
	@Transactional()
	async registerCustomer(dto: RegisterCustomerDto) {
		// 1) Check for existing email or phone
		await this.userService.checkIfEmailOrPhoneExist(dto.email, dto.phone);

		// 2) Create user with user type = customer
		const userType = (await this.userService.getUserTypeByName('customer')) as UserType;
		if (!userType) {
			throw new ApplicationError('User type "customer" not found', StatusCodes.INTERNAL_SERVER_ERROR);
		}
		const newUser = await this.userService.createUser({ ...dto, userTypeId: userType.userTypeId });

		// 3) Create linked customer record
		const newCustomer = await this.customerService.createCustomer({
			birthDate: dto.birthDate,
			gender: dto.gender as Gender,
			userId: newUser.userId
		});

		// 4) Create payload for token
		const payload: AuthorizedUser = {
			userId: newUser.userId,
			roles: newUser?.roles?.map((role) => role.name) || [],
			actorType: userType?.name,
			actorId: newCustomer.customerId
		};

		// 5) Generate tokens
		const tokens = this.generateTokens(payload);
		return tokens;
	}

	// Send OTP to user phone
	async requestOtp(phone: string) {
		await this.userService.getOneOrFailBy({ phone });

		const otp = OtpService.generateOtp();

		await OtpService.saveOtp(phone, otp);

		await SmsService.sendOtp(phone, otp);
	}

	// Verify submitted OTP and generate a short-lived reset token
	async verifyOtp(phone: string, otp: string) {
		const isValid = await OtpService.verifyOtp(phone, otp);
		if (!isValid) throw new ApplicationError('Invalid OTP', StatusCodes.UNAUTHORIZED);

		const resetToken = this.jwtService.sign({ phone }, { expiresIn: '5m' });

		await OtpService.saveResetToken(phone, resetToken);

		return { resetToken };
	}

	// Reset user password after OTP verification
	async resetPassword(phone: string, newPassword: string, resetToken: string) {
		const valid = await OtpService.verifyResetToken(phone, resetToken);
		if (!valid) throw new ApplicationError('Invalid or expired reset token', StatusCodes.UNAUTHORIZED);

		const user = await this.userService.getOneOrFailBy({ phone });

		await this.userService.updatePassword(user.userId, newPassword);
		await OtpService.invalidateResetToken(phone);
	}

	// Register restaurant owner (with role assignment)
	@Transactional()
	async registerRestaurantOwner(dto: RegisterDto) {
		// 1) Validate phone/email not taken
		await this.userService.checkIfEmailOrPhoneExist(dto.email, dto.phone);

		// 2) Create user with user type = restaurant_user
		const userType = (await this.userService.getUserTypeByName('restaurant')) as UserType;
		const newUser = await this.userService.createRestaurantOwnerUser({ ...dto, userTypeId: userType.userTypeId });

		// 3) Assign default restaurant_admin role to user
		await this.roleService.assignRoleToUser(newUser.userId, 'restaurant_admin');

		const updatedUser = await this.userService.getOneOrFailBy({ userId: newUser.userId, relations: ['roles'] });

		// 4) Create payload
		const payload: AuthorizedUser = {
			userId: updatedUser.userId,
			roles: updatedUser?.roles?.map((role) => role.name) || [],
			actorType: userType?.name,
			actorId: updatedUser.userId // actorId is the user for restaurant
		};

		// 5) Generate tokens
		const tokens = this.generateTokens(payload);
		return tokens;
	}
}
