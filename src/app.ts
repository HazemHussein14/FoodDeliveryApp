import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import ApiRouter from './routes/api.routes';
import { addRequestTimeMiddleware, ErrorHandler, NotFoundHandler } from './middlewares';
import { defaultRateLimiter } from './config/ratelimiter';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDocSpecs from './swagger/swagger';

export const createApp = (): Application => {
	const app = express();

	// register middlewares
	app.use(addRequestTimeMiddleware); // add request time
	app.use(compression());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cors());
	app.use(helmet());
	app.use(morgan('dev'));
	app.use(defaultRateLimiter);

	// setup routes
	app.use('/api/v1', ApiRouter);

	// swagger
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDocSpecs));

	// error handler
	app.use(NotFoundHandler);
	app.use(ErrorHandler);

	return app;
};
