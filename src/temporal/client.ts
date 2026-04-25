import { Connection, Client } from '@temporalio/client';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (client) {
    return client;
  }

  const connection = await Connection.connect({
    address: config.temporal.address,
  });

  client = new Client({
    connection,
    namespace: config.temporal.namespace,
  });

  logger.info(`Temporal: client connected to ${config.temporal.address}`);
  return client;
}
