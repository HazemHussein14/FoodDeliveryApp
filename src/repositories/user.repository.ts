import { AppDataSource } from '../config/data-source';
import { GetOneUserByDto } from '../dto/user.dto';
import { Role, User, UserRole, UserType } from '../models';
import { Repository } from 'typeorm';

export class UserRepository {
	private userRepo: Repository<User>;
	private userTypeRepo: Repository<UserType>;

	constructor() {
		// Initialize repositories for User and UserType entities
		this.userRepo = AppDataSource.getRepository(User);
		this.userTypeRepo = AppDataSource.getRepository(UserType);
	}

	// Get a user type by its name (e.g., 'customer', 'admin', etc.)
	async getUserTypeByName(name: string): Promise<UserType | null> {
		return await this.userTypeRepo.findOne({
			where: { name }
		});
	}

	// Create and save a new user entity
	async createUser(data: Partial<User>): Promise<User> {
		const user = this.userRepo.create(data);
		return await this.userRepo.save(user);
	}

	// Get a user by their unique ID
	async getUserById(userId: number): Promise<User | null> {
		return await this.userRepo.findOne({
			where: { userId }
		});
	}

	// Get a user by their email address
	async getUserByEmail(email: string): Promise<User | null> {
		return await this.userRepo.findOne({
			where: { email }
		});
	}

	// Get a user by their phone number
	async getUserByPhone(phone: string): Promise<User | null> {
		return await this.userRepo.findOne({
			where: { phone }
		});
	}

	// Update user data and return the updated user
	async updateUser(userId: number, data: Partial<User>): Promise<User | null> {
		await this.userRepo.update(userId, data);
		return await this.getUserById(userId);
	}

	// Deactivate a user and store deactivation info
	async deactivateUser(userId: number, deactivationInfo: User['deactivationInfo']): Promise<void> {
		await this.userRepo.update(userId, { isActive: false, deactivationInfo });
	}

	// Search active users by name or email (case-insensitive)
	async searchUsers(query: string): Promise<User[]> {
		return await this.userRepo
			.createQueryBuilder('user')
			.where('user.name ILIKE :query', { query: `%${query}%` })
			.orWhere('user.email ILIKE :query', { query: `%${query}%` })
			.andWhere('user.isActive = :isActive', { isActive: true })
			.getMany();
	}

	// Get all users who are marked as active
	async getActiveUsers(): Promise<User[]> {
		return await this.userRepo.find({
			where: { isActive: true }
		});
	}

	// Update a user's password (already hashed)
	async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
		await this.userRepo.update(userId, { password: hashedPassword });
	}

	// Update user profile and return the updated user
	async updateUserProfile(userId: number, data: Partial<User>): Promise<User | null> {
		await this.userRepo.update(userId, data);
		return await this.getUserById(userId);
	}

	// Get one user with optional filters and relations
	async getOneBy(filter: GetOneUserByDto): Promise<User | null> {
		const query = this.userRepo.createQueryBuilder('user');

		const { withPassword, relations } = filter;

		// Include related entities if specified
		if (relations) {
			relations.forEach((relation) => {
				query.leftJoinAndSelect(`user.${relation}`, relation);
			});
		}

		// Include password in selection if requested
		if (withPassword) query.addSelect('user.password');

		// Apply filters conditionally
		if (filter.userId) query.andWhere('user.userId = :userId', { userId: filter.userId });
		if (filter.email) query.andWhere('user.email = :email', { email: filter.email });
		if (filter.phone) query.andWhere('user.phone = :phone', { phone: filter.phone });

		return await query.getOne();
	}

	// Get a user by either email or phone
	async getUserByEmailOrPhone(email: string, phone: string) {
		const query = this.userRepo.createQueryBuilder('user');
		query.where('user.email = :email OR user.phone = :phone', { email, phone });
		const user = await query.getOne();
		return user;
	}
}
