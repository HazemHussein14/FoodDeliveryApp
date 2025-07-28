import { StatusCodes } from 'http-status-codes';
import { config } from '../config/env';
import { LoginDto, RegisterCustomerDto, RegisterDto } from '../dto/auth.dto';
import { ApplicationError } from '../errors';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories';
import { JwtService } from '../shared/jwt';
import { CustomerService } from './customer.service';
import { UserService } from './user.service';
import { Transactional } from 'typeorm-transactional';
import { Gender, UserType } from '../models';
import { OtpService } from '../shared/otpService';
import { SmsService } from '../shared/smsService';
import { RoleService } from './role.service';

export class AuthService {
	private repo = new UserRepository();
	private jwtService = new JwtService();
	private userService = new UserService();
	private customerService = new CustomerService();
	private roleService: RoleService = new RoleService();

	async login(dto: LoginDto) {
		const user = await this.validateAndGetUser(dto);
		const userType = user.userType.name;
		let actorId = userType === 'customer' ? user.customer.customerId : user.userId; // TODO: create user restaurant enitity

		const payload: AuthorizedUser = {
			userId: user.userId,
			roles: user.roles.map((role) => role.name),
			actorType: user.userType.name,
			actorId // TODO: This should be replaced with actual actor ID after authentication
		};

		let loginPayload = null;

		if (userType.includes('restaurant')) {
			loginPayload = {
				...payload,
				restaurantId: user.restaurant[0].restaurantId
			};
		} else {
			loginPayload = payload;
		}

		const tokens = this.generateTokens(loginPayload);

		return tokens;
	}

	generateTokens(payload: AuthorizedUser) {
		const token = this.jwtService.sign(payload);
		const refresh = this.jwtService.sign(payload, {
			expiresIn: config.jwt.refreshTTL
		});

		return { token, refresh };
	}

	async validateAndGetUser(dto: LoginDto) {
		const user = await this.userService.getOneOrFailBy({
			email: dto.email,
			withPassword: true,
			relations: ['roles', 'userType', 'customer', 'restaurant']
		});

		if (!user.isActive) throw new ApplicationError('User is inactive', StatusCodes.UNAUTHORIZED);

		const isPasswordValid = await this.userService.comparePasswords(dto.password, user.password);

		if (!isPasswordValid) throw new ApplicationError('Invalid credentials', StatusCodes.UNAUTHORIZED);

		const userWithOutPassword = { ...user, password: undefined };
		return userWithOutPassword;
	}

	@Transactional()
	async registerCustomer(dto: RegisterCustomerDto) {
		// 1) validate email or phone not exists
		await this.userService.checkIfEmailOrPhoneExist(dto.email, dto.phone);

		// 2) create user record
		const userType = (await this.userService.getUserTypeByName('customer')) as UserType;
		const newUser = await this.userService.createUser({ ...dto, userTypeId: userType.userTypeId });

		// 3) create customer record
		const newCustomer = await this.customerService.createCustomer({
			birthDate: dto.birthDate,
			gender: dto.gender as Gender,
			userId: newUser.userId
		});

		// 4) create Authorize payload
		const payload: AuthorizedUser = {
			userId: newUser.userId,
			roles: newUser?.roles?.map((role) => role.name) || [],
			actorType: userType?.name,
			actorId: newCustomer.customerId
		};

		// 3) generate tokens
		const tokens = this.generateTokens(payload);

		return tokens;
	}

	async requestOtp(phone: string) {
		await this.userService.getOneOrFailBy({ phone });

		const otp = OtpService.generateOtp();

		await OtpService.saveOtp(phone, otp);

		await SmsService.sendOtp(phone, otp);
	}

	async verifyOtp(phone: string, otp: string) {
		const isValid = await OtpService.verifyOtp(phone, otp);
		if (!isValid) throw new ApplicationError('Invalid OTP', StatusCodes.UNAUTHORIZED);

		const resetToken = this.jwtService.sign({ phone }, { expiresIn: '5m' });

		await OtpService.saveResetToken(phone, resetToken);

		return { resetToken };
	}

	async resetPassword(phone: string, newPassword: string, resetToken: string) {
		const valid = await OtpService.verifyResetToken(phone, resetToken);
		if (!valid) throw new ApplicationError('Invalid or expired reset token', StatusCodes.UNAUTHORIZED);

		const user = await this.userService.getOneOrFailBy({ phone });

		await this.userService.updatePassword(user.userId, newPassword);
		await OtpService.invalidateResetToken(phone);
	}

	@Transactional()
	async registerRestaurantOwner(dto: RegisterDto) {
		// 1) validate email or phone not exists
		await this.userService.checkIfEmailOrPhoneExist(dto.email, dto.phone);

		// 2) create user record
		const userType = (await this.userService.getUserTypeByName('restaurant_user')) as UserType;
		const newUser = await this.userService.createRestaurantOwnerUser({ ...dto, userTypeId: userType.userTypeId });

		// 3) assign role to user
		await this.roleService.assignRoleToUser(newUser.userId, 'restaurant_admin');

		const updatedUser = await this.userService.getOneOrFailBy({ userId: newUser.userId, relations: ['roles'] });

		// 4) create Authorize payload
		const payload: AuthorizedUser = {
			userId: updatedUser.userId,
			roles: updatedUser?.roles?.map((role) => role.name) || [],
			actorType: userType?.name,
			actorId: updatedUser.userId
		};

		// 5) generate tokens
		const tokens = this.generateTokens(payload);

		return tokens;
	}
}
