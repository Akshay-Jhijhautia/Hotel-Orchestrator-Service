type LogContext = Record<string, unknown>;

const writeLog = (level: 'info' | 'error', message: string, context?: LogContext): void => {
  const payload = {
    level,
    message,
    ...(context ? { context } : {}),
    timestamp: new Date().toISOString(),
  };

  process.stdout.write(`${JSON.stringify(payload)}\n`);
};

export const logger = {
  info: (message: string, context?: LogContext): void => {
    writeLog('info', message, context);
  },
  error: (message: string, context?: LogContext): void => {
    writeLog('error', message, context);
  },
};
