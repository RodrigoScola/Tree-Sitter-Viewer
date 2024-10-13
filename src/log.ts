import winston from 'winston';

export class Logger {
	private readonly logger: winston.Logger;
	constructor(logger: winston.Logger) {
		this.logger = logger;
	}
	debug(message: string, ...meta: any[]) {
		this.logger.debug(message);
		if (meta) {
			for (const item of meta) {
				this.logger.debug(item);
			}
		}
	}
	error(message: string, ...meta: any[]) {
		this.logger.error(message);
		if (meta) {
			for (const item of meta) {
				this.logger.error(item);
			}
		}
	}
	add(message: string, ...meta: any[]) {
		this.logger.info(message);
		if (meta) {
			for (const item of meta) {
				this.logger.info(item);
			}
		}
	}
}

export function createLogger() {
	const mylogger = winston.createLogger({
		level: 'debug',
		format: winston.format.simple(),
		transports: [
			new winston.transports.File({
				filename: 'error.log',
				level: 'error',
			}),
			new winston.transports.File({ filename: './combined.log' }),
		],
	});

	if (process.env.NODE_ENV !== 'production') {
		mylogger.add(
			new winston.transports.Console({
				format: winston.format.simple(),
			})
		);
	}

	return mylogger;
}
