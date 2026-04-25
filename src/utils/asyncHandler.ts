import { Request, Response, NextFunction } from 'express';

type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export function asyncHandler(fn: RouteHandler): RouteHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
