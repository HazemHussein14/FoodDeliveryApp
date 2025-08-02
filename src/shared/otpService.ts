import { redisService } from './redis';
import { SettingService } from '../services/setting.service';
import { SettingKey } from '../enums/setting.enum';

export class OtpService {
	static generateOtp(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	static async saveOtp(phone: string, otp: string) {
		const OTP_EXPIRE_TIME_MS = (await SettingService.get(SettingKey.OTP_EXPIRATION_TIME_MS)) as number;
		await redisService.set(`otp:${phone}`, otp, OTP_EXPIRE_TIME_MS);
	}

	static async verifyOtp(phone: string, otp: string): Promise<boolean> {
		const saved = await redisService.get(`otp:${phone}`);

		if (saved === otp) {
			await redisService.del(`otp:${phone}`);
			return true;
		}

		return false;
	}

	static async saveResetToken(phone: string, token: string) {
		const RESET_TOKEN_EXPIRE_TIME_MS = (await SettingService.get(SettingKey.RESET_TOKEN_EXPIRE_TIME_MS)) as number;
		await redisService.set(`reset:${phone}`, token, RESET_TOKEN_EXPIRE_TIME_MS);
	}

	static async verifyResetToken(phone: string, token: string): Promise<boolean> {
		const saved = await redisService.get(`reset:${phone}`);
		return saved === token;
	}

	static async invalidateResetToken(phone: string) {
		await redisService.del(`reset:${phone}`);
	}
}
