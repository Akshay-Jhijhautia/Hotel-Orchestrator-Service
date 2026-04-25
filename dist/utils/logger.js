"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const writeLog = (level, message, context) => {
    const payload = {
        level,
        message,
        ...(context ? { context } : {}),
        timestamp: new Date().toISOString(),
    };
    process.stdout.write(`${JSON.stringify(payload)}\n`);
};
exports.logger = {
    info: (message, context) => {
        writeLog('info', message, context);
    },
    error: (message, context) => {
        writeLog('error', message, context);
    },
};
