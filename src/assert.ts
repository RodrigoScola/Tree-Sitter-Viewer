function assert(truthy: any, message: string): asserts truthy {
	if (!truthy) {
		logger.error(message);
		throw new Error(message);
	}
}

assert.ok = function (truthy: any, message: string) {
	if (!truthy) {
		logger.error(message);
		throw new Error(message);
	}
};

export function initAssert() {
	return assert;
}
