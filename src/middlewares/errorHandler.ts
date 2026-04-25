import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message} (status: ${err.statusCode})`);
    sendError(res, err.message, err.statusCode);
    return;
  }

  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  sendError(res, 'Internal Server Error', 500);
}
