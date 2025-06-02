import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.accessTTL;

export class JwtService {
	private readonly secret: string;
	private readonly expiresIn: string;

	constructor(secret = JWT_SECRET, expiresIn = JWT_EXPIRES_IN) {
		this.secret = secret;
		this.expiresIn = expiresIn;
	}

	sign(payload: Record<string, any>, options?: SignOptions): string {
		return jwt.sign(payload, this.secret, {
			expiresIn: this.expiresIn as any,
			...(options || {})
		});
	}

	verify(token: string): string | JwtPayload {
		return jwt.verify(token, this.secret);
	}

	decode(token: string): null | { [key: string]: any } | string {
		return jwt.decode(token);
	}
}
