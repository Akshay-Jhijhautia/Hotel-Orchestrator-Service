import { config } from '../config/env';
import { SupplierHotel, HotelOffer } from '../types/hotel.types';
import { dedupeAndSelectBest } from '../services/hotelDedupe.service';
import { saveHotelsToRedis as writeHotelsToRedis } from '../services/redisHotelWriter.service';
import { logger } from '../utils/logger';

interface SupplierApiResponse {
  success: boolean;
  data: SupplierHotel[];
}

async function fetchSupplierHotels(baseUrl: string, city: string): Promise<SupplierHotel[]> {
  const url = `${baseUrl}?city=${encodeURIComponent(city)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Supplier request failed with status ${response.status}`);
  }

  const body = (await response.json()) as SupplierApiResponse;
  return body.data;
}

export async function fetchSupplierAHotels(city: string): Promise<SupplierHotel[]> {
  logger.info(`Activity: fetching Supplier A hotels for "${city}"`);
  return fetchSupplierHotels(config.suppliers.supplierAUrl, city);
}

export async function fetchSupplierBHotels(city: string): Promise<SupplierHotel[]> {
  logger.info(`Activity: fetching Supplier B hotels for "${city}"`);
  return fetchSupplierHotels(config.suppliers.supplierBUrl, city);
}

export async function dedupeAndSelectBestOffers(
  supplierAHotels: SupplierHotel[],
  supplierBHotels: SupplierHotel[],
): Promise<HotelOffer[]> {
  logger.info(`Activity: deduplicating ${supplierAHotels.length + supplierBHotels.length} hotels`);
  return dedupeAndSelectBest(supplierAHotels, supplierBHotels);
}

export async function saveHotelsToRedis(city: string, hotels: HotelOffer[]): Promise<void> {
  logger.info(`Activity: saving ${hotels.length} hotels to Redis for "${city}"`);
  await writeHotelsToRedis(city, hotels);
}
