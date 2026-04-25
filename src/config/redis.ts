import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

const { host, port } = config.redis;

export const redisClient = new Redis({
  host,
  port,
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    if (times > 5) {
      logger.error('Redis: max retry attempts reached, giving up');
      return null;
    }
    const delay = Math.min(times * 200, 2000);
    logger.warn(`Redis: retrying connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
});

redisClient.on('connect', () => {
  logger.info('Redis: connected successfully');
});

redisClient.on('error', (err: Error) => {
  logger.error(`Redis: connection error — ${err.message}`);
});
