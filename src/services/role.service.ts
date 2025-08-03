import { In, Repository } from "typeorm";
import { UserService } from "./user.service";
import { ApplicationError } from "../errors";
import { AppDataSource } from "../config/data-source";
import { Role } from "../models";
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';

@injectable()
export class RoleService {
	constructor(
		@inject(TYPES.UserService) private readonly userService: UserService
	) {}

	private roleRepo: Repository<Role> = AppDataSource.getRepository(Role);

	async createRole(name: string): Promise<Role> {
		const existing = await this.roleRepo.findOne({ where: { name } });
		if (existing) throw new ApplicationError('Role already exists', 400);

		const role = this.roleRepo.create({ name });
		return await this.roleRepo.save(role);
	}

	async getAllRoles(): Promise<Role[]> {
		return await this.roleRepo.find();
	}

	async getRoleByName(name: string): Promise<Role> {
		const role = await this.roleRepo.findOne({ where: { name } });
		if (!role) throw new ApplicationError(`Role '${name}' not found`, 404);
		return role;
	}

	async getRolesByNames(names: string[]): Promise<Role[]> {
		const roles = await this.roleRepo.findBy({ name: In(names) });
		if (roles.length !== names.length) {
			throw new ApplicationError('One or more roles not found', 404);
		}
		return roles;
	}

	async deleteRoleByName(name: string): Promise<void> {
		const role = await this.roleRepo.findOne({ where: { name } });
		if (!role) throw new ApplicationError('Role not found', 404);
		await this.roleRepo.remove(role);
	}

	async assignRoleToUser(userId: number, roleName: string): Promise<void> {
		const user = await this.userService.getOneOrFailBy({ userId, relations: ['roles'] });
		const role = await this.getRoleByName(roleName);

		// Avoid duplicates
		if (!user.roles.some((r) => r.roleId === role.roleId)) {
			user.roles.push(role);
			await user.save();
		}
	}
}
