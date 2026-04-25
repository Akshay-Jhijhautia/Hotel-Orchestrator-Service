import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import type { HotelOffer } from '../types/hotel.types';

const {
  fetchSupplierAHotels,
  fetchSupplierBHotels,
  dedupeAndSelectBestOffers,
  saveHotelsToRedis,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 3,
  },
});

export async function hotelOfferWorkflow(city: string): Promise<HotelOffer[]> {
  // Step 1: Fetch from both suppliers in parallel
  const [supplierAHotels, supplierBHotels] = await Promise.all([
    fetchSupplierAHotels(city),
    fetchSupplierBHotels(city),
  ]);

  // Step 2: Deduplicate and select the cheapest offers
  const bestOffers = await dedupeAndSelectBestOffers(supplierAHotels, supplierBHotels);

  // Step 3: Save the final list to Redis
  await saveHotelsToRedis(city, bestOffers);

  // Step 4: Return the deduplicated list
  return bestOffers;
}
