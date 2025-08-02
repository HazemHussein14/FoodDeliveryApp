import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import { ApplicationError, ErrMessages } from '../errors';
import { UserRepository } from '../repositories';
import { CreateUserDto, GetOneUserByDto } from '../dto/user.dto';
import { User } from '../models';
import { HashingService } from '../shared/secureHashing';
import logger from '../config/logger';

export class UserService {
	private userRepo = new UserRepository();

	async createUser(dto: CreateUserDto) {
		const hashedPassword = await HashingService.hash(dto.password);

		const newUser = await this.userRepo.createUser({ ...dto, password: hashedPassword });

		logger.info(`User created with ID: ${newUser.userId}`);

		return newUser;
	}

	async getActiveUsers(data: any) {
		return this.userRepo.getActiveUsers();
	}

	async getOne(id: number) {
		const user = await this.userRepo.getUserById(id);
		if (!user) throw new ApplicationError('User not found', HttpStatusCodes.NOT_FOUND);
		return user;
	}

	async getOneOrFailBy(filter: GetOneUserByDto) {
		if (Object.keys(filter).length === 0) throw new ApplicationError('Invalid filter', HttpStatusCodes.BAD_REQUEST);

		const user = await this.userRepo.getOneBy(filter);

		if (!user) throw new ApplicationError('User not found', HttpStatusCodes.NOT_FOUND);

		return user;
	}

	async getOneBy(filter: GetOneUserByDto) {
		if (Object.keys(filter).length === 0) return null;

		const user = await this.userRepo.getOneBy(filter);

		return user || null;
	}

	async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
		return await HashingService.verify(plainText, hashed);
	}

	async deactivateUser(userId: number, deactivationInfo: User['deactivationInfo']): Promise<void> {
		await this.userRepo.deactivateUser(userId, deactivationInfo);
	}

	// async getUserTypeByName(name: string) {
	// 	return await this.userRepo.getUserTypeByName(name);
	// }

	async getUserTypeByName(name: string) {
		console.log('[DEBUG] Looking for user type:', name); // ✅ Debug log
		const type = await this.userRepo.getUserTypeByName(name);
		if (!type) console.warn('[WARN] userType not found:', name); // ✅ Warning if null
		return type;
	}

	async ensureEmailUniqueness(email: string) {
		const user = await this.userRepo.getUserByEmail(email);
		if (user) throw new ApplicationError(ErrMessages.user.EmailAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	async ensurePhoneUniqueness(phone: string) {
		const user = await this.userRepo.getUserByPhone(phone);
		if (user) throw new ApplicationError(ErrMessages.user.PhoneAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	async checkIfEmailOrPhoneExist(email: string, phone: string): Promise<void> {
		const user = await this.userRepo.getUserByEmailOrPhone(email, phone);

		if (!user) return;
		if (user.email === email) throw new ApplicationError(ErrMessages.user.EmailAlreadyExists, StatusCodes.BAD_REQUEST);
		if (user.phone === phone) throw new ApplicationError(ErrMessages.user.PhoneAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	async updatePassword(userId: number, newPassword: string) {
		const hashedPassword = await HashingService.hash(newPassword);
		return await this.userRepo.updateUser(userId, { password: hashedPassword });
	}

	async createRestaurantOwnerUser(dto: CreateUserDto) {
		return this.createUser({ ...dto, isActive: false });
	}

	async updateUser(userId: number, dto: Partial<User>) {
		const user = await this.userRepo.updateUser(userId, dto);
		if (!user) throw new ApplicationError('User not found', HttpStatusCodes.NOT_FOUND);

		return user;
	}
}
