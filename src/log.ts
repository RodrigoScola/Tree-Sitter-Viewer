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
