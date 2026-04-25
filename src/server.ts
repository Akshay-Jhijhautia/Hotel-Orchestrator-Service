import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const { port } = config;

app.listen(port, () => {
  logger.info(`Hotel Offer Orchestrator running on port ${port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});
