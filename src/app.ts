import cors from 'cors';
import express, { RequestHandler } from 'express';
import helmet from 'helmet';

import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { successResponse } from './utils/apiResponse';

const bootstrapRoute: RequestHandler = (_req, res) => {
  res.status(200).json(successResponse({ status: 'ok' }));
};

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(rateLimiter);
  app.use(express.json());

  app.get('/', bootstrapRoute);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
