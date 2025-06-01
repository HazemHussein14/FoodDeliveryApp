import { config } from "../config/env";
import { AuthorizedUser } from "../middlewares/auth.middleware";
import { UserRepository } from "../repositories";
import { JwtService } from "../shared/jwt";

export class AuthService {
	private repo = new UserRepository();
	private jwtService = new JwtService();

	async login(data: any) {
		// todo: implement login logic
		const {role} = data;
		const roles = [];
		if (role === 'customer') roles.push('customer');
		if (role === 'restaurant_user') roles.push('restaurant_user', 'editor');

		const payload: AuthorizedUser = {
			userId: 1, // This should be replaced with actual user ID after authentication
			roles,
			actorType: role === 'customer' ? 'customer' : 'restaurant_user',
			actorId: 6 // This should be replaced with actual actor ID after authentication
		};

		const token = this.jwtService.sign(payload);
		const refresh = this.jwtService.sign(payload, {
			expiresIn: config.jwt.refreshTTL
		});

		return {token, refresh};
	}

	async logout() {
		// todo
	}

	async register() {
		// todo
	}

	async forgetPassword() {
		// todo
	}
}
