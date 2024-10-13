import { initAssert } from './src/assert';
import { Logger } from './src/log';

export {};

declare global {
	var logger: Logger;
	var assert: ReturnType<typeof initAssert>;
}
