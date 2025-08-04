import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';

export class AppController {
	async checkHealth(_req: Request, res: Response) {
		const memUsage = process.memoryUsage();
		const uptime = process.uptime();
		const memory = {
			rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
			heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
			heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
			external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
		};
		const cpuUsage = process.cpuUsage();
		const metrics = {
			uptime,
			memory,
			cpuUsage
		};
		sendResponse(res, StatusCodes.OK, 'OK', metrics);
	}
}
