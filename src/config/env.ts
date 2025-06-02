import * as dotenv from 'dotenv';
import Joi from 'joi';
import { resolve, join } from 'path';
import logger from './logger';

// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV + '.env'; // ex: development.env

dotenv.config({ path: resolve(join(process.cwd(), 'env', envFile)) });

// Define the schema for environment variables
const envSchema = Joi.object({
	NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
	PORT: Joi.number().default(3000),
	DATABASE_HOST: Joi.string().required(),
	DATABASE_PORT: Joi.number().default(5432),
	DATABASE_USERNAME: Joi.string().required(),
	DATABASE_PASSWORD: Joi.string().required(),
	DATABASE_NAME: Joi.string().required(),
	DATABASE_LOGGING: Joi.boolean().default(false),
	DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
	REDIS_HOST: Joi.string().required(),
	REDIS_PORT: Joi.number().default(6379),
	REDIS_DEFAULT_TTL: Joi.number().default(3600)
	// TODO: add more env variable here
}).unknown(true);

// Validate environment variables

const { error, value: envVars } = envSchema.validate(process.env, {
	abortEarly: false
});

if (error) {
	logger.error('Environment variable validation failed', error.details);
	throw new Error(`Environment validation failed: ${error.message}`);
}

// Export validated environment variables
export const config = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	database: {
		host: envVars.DATABASE_HOST,
		port: envVars.DATABASE_PORT,
		name: envVars.DATABASE_NAME,
		username: envVars.DATABASE_USERNAME,
		password: envVars.DATABASE_PASSWORD,
		logging: envVars.DATABASE_LOGGING,
		synchronize: envVars.DATABASE_SYNCHRONIZE
	},
	redis: {
		host: envVars.REDIS_HOST,
		port: envVars.REDIS_PORT,
		ttl: envVars.REDIS_DEFAULT_TTL
	},
	jwt: {
		secret: envVars.JWT_SECRET,
		accessTTL: envVars.JWT_ACCESS_EXPIRE_IN, // '1y'
		refreshTTL: envVars.JWT_REFRESH_EXPIRE_IN
	}
};
