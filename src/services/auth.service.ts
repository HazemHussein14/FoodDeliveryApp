import { config } from "../config/env";
import bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from "../dto/auth.dto";
import { ApplicationError, ErrMessages } from "../errors";
import { AuthorizedUser } from "../middlewares/auth.middleware";
import { UserRepository } from "../repositories";
import { JwtService } from "../shared/jwt";

export class AuthService {
	private repo = new UserRepository();
	private jwtService = new JwtService();

	async login(data: LoginDto) {
		const { email, password, role } = data;
		const user = await this.repo.getUserByEmail(email);
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new ApplicationError(ErrMessages.auth.InvalidCredentials);
		}

		const roles = await this.repo.getUserRoles(user.userId);
		const actorId = await this.repo.getActorIdByUserType(user.userId, role);

		const payload: AuthorizedUser = {
			userId: user.userId,
			roles,
			actorType: role,
			actorId
		};

		const token = this.jwtService.sign(payload);
		const refresh = this.jwtService.sign(payload, { expiresIn: config.jwt.refreshTTL });

		return { token, refresh };
	}

	async register(data: RegisterDto) {
		const hashedPassword = await bcrypt.hash(data.password, 10);
		const user = await this.repo.createUser({ ...data, password: hashedPassword });
		await this.repo.assignDefaultRole(user.userId, 'customer');
		return { userId: user.userId, email: user.email };
	}

	async logout() {
		// todo
	}

	async forgetPassword() {
		// todo
	}
}
