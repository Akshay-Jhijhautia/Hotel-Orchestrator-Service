import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { config } from '../config/env';
import { logger } from '../utils/logger';

async function runWorker(): Promise<void> {
  const connection = await NativeConnection.connect({
    address: config.temporal.address,
  });

  const worker = await Worker.create({
    connection,
    namespace: config.temporal.namespace,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: config.temporal.taskQueue,
  });

  logger.info(`Temporal: worker started on task queue "${config.temporal.taskQueue}"`);
  await worker.run();
}

runWorker().catch((err: Error) => {
  logger.error(`Temporal worker failed: ${err.message}`);
  process.exit(1);
});
