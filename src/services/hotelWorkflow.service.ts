import { getTemporalClient } from '../temporal/client';
import { config } from '../config/env';
import { HotelOffer } from '../types/hotel.types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export async function startHotelOfferWorkflow(city: string): Promise<HotelOffer[]> {
  const client = await getTemporalClient();
  const workflowId = `hotel-offer-${city.toLowerCase()}-${uuidv4()}`;

  logger.info(`Starting hotelOfferWorkflow for city="${city}" (id: ${workflowId})`);

  const handle = await client.workflow.start('hotelOfferWorkflow', {
    args: [city],
    taskQueue: config.temporal.taskQueue,
    workflowId,
  });

  const result = await handle.result();
  logger.info(`Workflow completed for city="${city}" — ${result.length} hotels`);

  return result;
}
