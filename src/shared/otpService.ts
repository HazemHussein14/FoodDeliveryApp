import { redisService } from './redis';
import { SettingService } from '../services/setting.service';
import { SettingKey } from '../enums/setting.enum';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';

@injectable()
export class OtpService {
	constructor(
		@inject(TYPES.SettingService) private readonly settingService: SettingService
	) {}

	 generateOtp(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	 async saveOtp(phone: string, otp: string) {
		const OTP_EXPIRE_TIME_MS = await this.settingService.getSettingValue(SettingKey.OTP_EXPIRATION_TIME_MS);
		await redisService.set(`otp:${phone}`, otp, OTP_EXPIRE_TIME_MS);
	}

	 async verifyOtp(phone: string, otp: string): Promise<boolean> {
		const saved = await redisService.get(`otp:${phone}`);

		if (saved === otp) {
			await redisService.del(`otp:${phone}`);
			return true;
		}

		return false;
	}

	 async saveResetToken(phone: string, token: string) {
		const RESET_TOKEN_EXPIRE_TIME_MS = (await this.settingService.getSettingValue(SettingKey.RESET_TOKEN_EXPIRE_TIME_MS)) as number;
		await redisService.set(`reset:${phone}`, token, RESET_TOKEN_EXPIRE_TIME_MS);
	}

	 async verifyResetToken(phone: string, token: string): Promise<boolean> {
		const saved = await redisService.get(`reset:${phone}`);
		return saved === token;
	}

	 async invalidateResetToken(phone: string) {
		await redisService.del(`reset:${phone}`);
	}
}
