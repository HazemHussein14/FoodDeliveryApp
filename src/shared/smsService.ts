import logger from '../config/logger';
import { injectable } from 'inversify';

@injectable()
export class SmsService {
	async sendOtp(phone: string, otp: string) {
		const message = `Your OTP is: ${otp}`;
		logger.info(`📩 Sending OTP to ${phone}: ${message}`);
	}
}
