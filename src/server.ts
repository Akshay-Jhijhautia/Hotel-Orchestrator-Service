import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info('Hotel Offer Orchestrator API started', {
    port: env.port,
    nodeEnv: env.nodeEnv,
  });
});
