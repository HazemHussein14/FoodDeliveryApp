import logger from '../config/logger';

export class SmsService {
	static async sendOtp(phone: string, otp: string) {
		const message = `Your OTP is: ${otp}`;
		logger.info(`📩 Sending OTP to ${phone}: ${message}`);
	}
}
