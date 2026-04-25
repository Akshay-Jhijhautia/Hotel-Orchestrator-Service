import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncRouteHandler): AsyncRouteHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
