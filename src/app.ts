import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimiter } from './middlewares/rateLimiter';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// --------------- Security & Parsing Middleware ---------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// --------------- Routes (to be registered in later features) ---------------

// --------------- Error Handling ---------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
