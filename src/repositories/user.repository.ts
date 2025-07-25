import { AppDataSource } from '../config/data-source';
import { Role, User, UserRole } from '../models';
import { Repository } from 'typeorm';

export class UserRepository {
	private userRepo: Repository<User> = AppDataSource.getRepository(User);
	private roleRepo: Repository<Role> = AppDataSource.getRepository(Role);
	private userRoleRepo: Repository<UserRole> = AppDataSource.getRepository(UserRole);

	async getUserByEmail(email: string): Promise<User | null> {
		return this.userRepo.findOne({ where: { email }, relations: ['userRoles'] });
	}

	async createUser(user: Partial<User>): Promise<User> {
		const newUser = this.userRepo.create(user);
		return await this.userRepo.save(newUser);
	}

	async assignDefaultRole(userId: number, roleName: string): Promise<void> {
		const role = await this.roleRepo.findOne({ where: { name: roleName } });
		if (!role) throw new Error(`Role ${roleName} not found`);
		const userRole = this.userRoleRepo.create({ userId, roleId: role.roleId });
		await this.userRoleRepo.save(userRole);
	}

	async getUserRoles(userId: number): Promise<string[]> {
		const roles = await this.userRoleRepo.find({
			where: { userId },
			relations: ['role']
		});
		return roles.map((ur) => ur.role.name);
	}

	async getUserTypeId(userId: number): Promise<number> {
		const user = await this.userRepo.findOne({ where: { userId }, relations: ['userType'] });
		if (!user) throw new Error('User not found');
		return user.userTypeId;
	}

	async getActorIdByUserType(userId: number, actorType: string): Promise<number> {
		if (actorType === 'customer') {
			const customer = await AppDataSource.getRepository('Customer').findOne({ where: { userId } });
			return customer?.customerId;
		} else {
			const restaurant = await AppDataSource.getRepository('Restaurant').findOne({ where: { userId } });
			return restaurant?.restaurantId;
		}
	}

	async getActiveUsers(): Promise<User[]> {
		return await this.userRepo.find({
			where: { isActive: true }
		});
	}

	async getUserById(userId: number): Promise<User | null> {
		return await this.userRepo.findOne({
			where: { userId }
		});
	}

	async updateUser(userId: number, data: Partial<User>) {
		await this.userRepo.update(userId, data);
	}
}
