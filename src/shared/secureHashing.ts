import * as argon2 from 'argon2';

export class HashingService {
	/**
	 * 🔐 Hash any sensitive value (password, token, key, etc.)
	 * @param value The value to hash
	 * @description Uses Argon2id with a memory cost of 65536 bytes,
	 * @returns The hashed value
	 */
	static async hash(value: string): Promise<string> {
		return await argon2.hash(value, {
			type: argon2.argon2id,
			memoryCost: 2 ** 16,
			timeCost: 5,
			parallelism: 1
		});
	}

	/**
	 * Verify a hashed value against a plain value
	 * @param value The plain value to verify
	 * @param hashed The hashed value to compare against
	 * @returns True if the values match, false otherwise
	 */
	static async verify(value: string, hashed: string): Promise<boolean> {
		return argon2.verify(hashed, value);
	}
}
