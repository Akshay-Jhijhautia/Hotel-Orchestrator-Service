import { ErrorRequestHandler } from 'express';

import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  logger.error('Unhandled application error', {
    message: error instanceof Error ? error.message : 'Unknown error',
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
