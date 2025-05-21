import 'reflect-metadata';
import { config } from './config/env';
import { createApp } from './app';
import logger from './config/logger';
import { AppDataSource, startDataSource } from './config/data-source';
import { startRedis } from './config/redis-client';

async function startServer() {
	const app = createApp();

	// start database connection
	await startDataSource();

	// Start Redis connection
	await startRedis();

	app.listen(config.port, () => {
		logger.info(`Server running on http://localhost:${config.port} | ENV:(${config.env})`);
		logger.info(`Documentation http://localhost:${config.port}/docs`);
	});
}

startServer();
