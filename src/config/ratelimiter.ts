import { Request, Response } from 'express';
import { Options, rateLimit } from 'express-rate-limit';
import { getIpFromRequest, secondsToMilliseconds } from '../utils/helper';
import { sendResponse } from '../utils/sendResponse';

// TODO: add it to database to make it more dynamic
const skippedIps: string[] = []; // will be used to skip rate limiting on some ips
const skippedRoutes: string[] = []; // will be used to skip rate limiting on some routes
// '/api/v1/app/health'

const skipLimiter = (req: Request, res: Response): boolean => {
	const ip = getIpFromRequest(req) as string;

	console.log('ip', ip);
	if (ip && skippedIps.includes(ip)) return true;
	if (skippedRoutes.includes(req.path)) return true;

	return false;
};

const rateLimiterMessage = (req: Request, res: Response) => sendResponse(res, 429, 'Too many requests, please try again later.');

const defaultOptions: Partial<Options> = {
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
	skip: skipLimiter,
	message: rateLimiterMessage
};

/**
 * A default rate limiter middleware for Express, allowing 100 requests per 5 minutes per IP address.
 */
export const defaultRateLimiter = rateLimit({
	windowMs: secondsToMilliseconds(5 * 60), // 5 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	...defaultOptions
});

/**
 * Creates a custom rate limiter middleware for Express.
 *
 * @param limit The maximum number of requests allowed per IP address within the specified window.
 * @param windowInSeconds The time window in seconds for which the rate limit applies.
 * @returns An Express middleware function that applies the custom rate limiting.
 */
export const customRateLimiter = (limit: number, windowInSeconds: number) => {
	return rateLimit({
		...defaultOptions,
		windowMs: secondsToMilliseconds(windowInSeconds), // customs time in ms
		limit // Limit each IP to custom number requests per `window`
	});
};
