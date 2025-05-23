import { AppDataSource } from '../config/data-source';
import { User } from '../models';
import { Repository } from 'typeorm';

export class UserRepository {
	private userRepo: Repository<User>;

	constructor() {
		this.userRepo = AppDataSource.getRepository(User);
	}

	async createUser(data: Partial<User>): Promise<User> {
		const user = this.userRepo.create(data);
		return await this.userRepo.save(user);
	}

	async getUserById(userId: number): Promise<User | null> {
		return await this.userRepo.findOne({
			where: { userId }
		});
	}

	async getUserByEmail(email: string): Promise<User | null> {
		return await this.userRepo.findOne({
			where: { email }
		});
	}

	async updateUser(userId: number, data: Partial<User>): Promise<User | null> {
		await this.userRepo.update(userId, data);
		return await this.getUserById(userId);
	}

	async deleteUser(userId: number): Promise<void> {
		await this.userRepo.update(userId, { isActive: false });
	}

	async searchUsers(query: string): Promise<User[]> {
		return await this.userRepo
			.createQueryBuilder('user')
			.where('user.name ILIKE :query', { query: `%${query}%` })
			.orWhere('user.email ILIKE :query', { query: `%${query}%` })
			.andWhere('user.isActive = :isActive', { isActive: true })
			.getMany();
	}

	async getActiveUsers(): Promise<User[]> {
		return await this.userRepo.find({
			where: { isActive: true }
		});
	}

	async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
		await this.userRepo.update(userId, { password: hashedPassword });
	}

	async updateUserProfile(userId: number, data: Partial<User>): Promise<User | null> {
		await this.userRepo.update(userId, data);
		return await this.getUserById(userId);
	}
}
