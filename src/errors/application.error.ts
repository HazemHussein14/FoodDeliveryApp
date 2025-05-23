import { StatusCodes } from 'http-status-codes';

export class ApplicationError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly data?: any;

	constructor(
		message: string,
		statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
		isOperational: boolean = true,
		data?: any
	) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.data = data;

		Error.captureStackTrace(this);
	}
}
