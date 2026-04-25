import { Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { config } from '../config/env';
import { logger } from '../utils/logger';

interface ServiceStatus {
  api: string;
  redis: string;
  supplierA: string;
  supplierB: string;
}

async function checkRedis(): Promise<string> {
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG' ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

async function checkSupplier(baseUrl: string): Promise<string> {
  try {
    const response = await fetch(`${baseUrl}?city=delhi`);
    return response.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const [redis, supplierA, supplierB] = await Promise.all([
    checkRedis(),
    checkSupplier(config.suppliers.supplierAUrl),
    checkSupplier(config.suppliers.supplierBUrl),
  ]);

  const services: ServiceStatus = {
    api: 'ok',
    redis,
    supplierA,
    supplierB,
  };

  const overallStatus = Object.values(services).every((s) => s === 'ok') ? 'ok' : 'degraded';

  const statusCode = overallStatus === 'ok' ? 200 : 503;

  if (overallStatus !== 'ok') {
    logger.warn(`Health check degraded: ${JSON.stringify(services)}`);
  }

  res.status(statusCode).json({ status: overallStatus, services });
}
