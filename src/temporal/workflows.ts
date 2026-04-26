import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from './activities';
import type { SupplierHotel, HotelOffer } from '../types/hotel.types';

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
  // Step 1: Fetch from both suppliers in parallel (graceful degradation)
  const [resultA, resultB] = await Promise.allSettled([
    fetchSupplierAHotels(city),
    fetchSupplierBHotels(city),
  ]);

  const supplierAHotels: SupplierHotel[] =
    resultA.status === 'fulfilled' ? resultA.value : [];
  const supplierBHotels: SupplierHotel[] =
    resultB.status === 'fulfilled' ? resultB.value : [];

  if (resultA.status === 'rejected') {
    log.warn(`Supplier A failed: ${resultA.reason}. Continuing with Supplier B only.`);
  }
  if (resultB.status === 'rejected') {
    log.warn(`Supplier B failed: ${resultB.reason}. Continuing with Supplier A only.`);
  }

  // Step 2: Deduplicate and select the cheapest offers
  const bestOffers = await dedupeAndSelectBestOffers(supplierAHotels, supplierBHotels);

  // Step 3: Save the final list to Redis
  await saveHotelsToRedis(city, bestOffers);

  // Step 4: Return the deduplicated list
  return bestOffers;
}
