import { DataSource } from 'typeorm';
import { initializeTransactionalContext, addTransactionalDataSource, StorageDriver } from 'typeorm-transactional';
import { config } from './env';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import logger from './logger';

//
export const AppDataSource = new DataSource({
	type: 'postgres',
	host: config.database.host, // Replace with your DB host
	port: config.database.port, // Default PostgreSQL port
	username: config.database.username, // Replace with your DB username
	password: config.database.password, // Replace with your DB password
	database: config.database.name, // Replace with your DB name
	synchronize: config.database.synchronize, // Auto-create tables (set to false in production)
	logging: config.database.logging, // Enable logging for debugging (optional)
	entities: ['src/models/**/*.ts'], // Path to your entity files
	migrations: ['src/migrations/**/*.ts'], // Path to migration files
	subscribers: ['src/subscribers/**/*.ts'], // Path to subscriber files
	poolSize: 10, // Connection pool size (adjust based on your needs)
	extra: {
		connectionTimeoutMillis: 2000, // Timeout for acquiring a connection
		idleTimeoutMillis: 30000 // Time before an idle connection is closed
	},
	namingStrategy: new SnakeNamingStrategy()
});

export const initializeDataSource = async () => {
	try {
		initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

		await AppDataSource.initialize();

		addTransactionalDataSource(AppDataSource);

		logger.info('Database connected successfully');
	} catch (error) {
		logger.error('Error connecting to the database:', error);
		throw error; // Re-throw to prevent server from starting with failed DB
	}
};
