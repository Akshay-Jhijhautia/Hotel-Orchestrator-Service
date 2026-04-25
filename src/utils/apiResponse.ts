import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/response.types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, statusCode = 500): void {
  const body: ApiErrorResponse = {
    success: false,
    message,
  };
  res.status(statusCode).json(body);
}
