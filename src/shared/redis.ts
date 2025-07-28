import Redis from 'ioredis';
import redis from '../config/redis-client';
import { config } from '../config/env';
import logger from '../config/logger';

class RedisService {
	private redis: Redis;

	constructor() {
		this.redis = redis;
	}

	async get<T = any>(key: string, log = false): Promise<T | null> {
		const data = await this.redis.get(key);
		if (log) logger.info(`Redis GET ${key} => ${!!data ? 'HIT' : 'MISS'}`);
		return data ? JSON.parse(data) : null;
	}

	async set(key: string, value: any, ttl: number = config.redis.ttl): Promise<void> {
		const payload = JSON.stringify(value);

		if (ttl === -1) await this.redis.set(key, payload);
		else await this.redis.set(key, payload, 'EX', ttl);
	}

	async del(key: string): Promise<void> {
		await this.redis.del(key);
	}

	async has(key: string): Promise<boolean> {
		const exists = await this.redis.exists(key);
		return exists === 1;
	}

	generateKey(prefix: string, id: string | number): string {
		return `${prefix}:${id}`;
	}
}

export const redisService = new RedisService();
