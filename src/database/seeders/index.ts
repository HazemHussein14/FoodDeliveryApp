import { DataSource, DeepPartial, ObjectLiteral, Repository } from 'typeorm';
import seedData from './seeded-data';
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV + '.env'; // ex: development.env
dotenv.config({ path: resolve(join(process.cwd(), 'env', envFile)) });

// Interface for seed data structure
export interface SeedData<T> {
	entity: new () => T;
	data: Partial<T>[];
}

function divider() {
	console.log('#'.repeat(50));
}

// Main Seed Service class

export class SeedService {
	datasource: DataSource;

	constructor() {
		this.datasource = new DataSource({
			type: 'postgres',
			host: process.env.DATABASE_HOST, // Replace with your DB host
			port: Number(process.env.DATABASE_PORT), // Default PostgreSQL port
			username: process.env.DATABASE_USERNAME, // Replace with your DB username
			password: process.env.DATABASE_PASSWORD, // Replace with your DB password
			database: process.env.DATABASE_NAME, // Replace with your DB name
			synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE), // Auto-create tables (set to false in production)
			// logging: Boolean(process.env.DATABASE_LOGGING), // Enable logging for debugging (optional)
			logging: false, // Enable logging for debugging (optional)
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
	}

	// Method to run the seeders
	async seed<T>(seedData: SeedData<T>[]): Promise<void> {
		try {
			divider();
			console.info('🚩 seeding tables...');

			await this.datasource.transaction(async (transactionalEntityManager) => {
				for (const { entity, data } of seedData) {
					const repo = transactionalEntityManager.getRepository(entity);
					await this.seedEntity(repo, data);
				}
			});
			console.info('✅ Database seeded successfully');
		} catch (error) {
			console.error('💥 Error seeding data:', error);
			throw error;
		}
	}

	// seed individual entity
	async seedEntity<T extends ObjectLiteral>(repo: Repository<T>, data: DeepPartial<T>[]): Promise<void> {
		try {
			const entities = data.map((item) => repo.create(item));
			await repo.save(entities, { chunk: 100 });
			console.info(`-> seeded ${entities.length} records for table: ${repo.metadata.tableName.toUpperCase()}`);
		} catch (error) {
			console.error(`💥 Error seeding data for ${repo.metadata.tableName.toUpperCase()}:`, error);
			throw error;
		}
	}

	// Method to clear all data from the database
	async clear(): Promise<void> {
		try {
			const entities = this.datasource.entityMetadatas;

			divider();
			console.info('🚩 clear all tables...');

			await this.datasource.transaction(async (transactionalEntityManager) => {
				for (const entity of entities) {
					const repo = transactionalEntityManager.getRepository(entity.name);
					await repo.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
					console.info(`-> Cleared table ${entity.tableName.toUpperCase()}`);
				}
			});
			console.info('✅ Database seeded successfully');
		} catch (error) {
			console.error('💥 Error clearing seeded data:', error);
			throw error;
		}
	}

	async resetSequences() {
		// Dynamically reset all sequences
		try {
			divider();
			console.info('🚩 resetting all sequences process...');

			await this.datasource.transaction(async (transactionalEntityManager) => {
				const sequences = await transactionalEntityManager.query(`
				SELECT sequencename
				FROM pg_sequences
				WHERE schemaname = 'public'
				`);

				for (const { sequencename } of sequences) {
					await transactionalEntityManager.query(`ALTER SEQUENCE "${sequencename}" RESTART WITH 1;`);
					console.info(`-> reset sequence ${sequencename}`);
				}

				console.info('✅ Database cleared and all sequences reset successfully');
			});
		} catch (error) {
			console.error('💥 Error clearing seeded data or resetting sequences:', error);
			throw error;
		}
	}

	async run(data: SeedData<any>[]) {
		try {
			await this.clear();
			await this.resetSequences();
			await this.seed(data);
		} catch (error) {
			throw error;
		} finally {
			this.datasource.destroy();
		}
	}
}

async function runSeed() {
	const seeder = new SeedService();
	if (!seeder.datasource.isInitialized) {
		await seeder.datasource.initialize();
	}

	console.log('🌱 Start Seeding database...');
	await seeder.run(seedData);
}

runSeed()
	.then(() => {
		divider();
		console.log('\n Seed process completed successfully... \n Good Bye 👋');
		process.exit(0);
	})
	.catch((error) => {
		console.error('💥 Seed process failed:', error);
		process.exit(1);
	});
