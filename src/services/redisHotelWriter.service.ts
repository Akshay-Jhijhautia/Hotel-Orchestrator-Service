import { redisClient } from '../config/redis';
import { HotelOffer } from '../types/hotel.types';
import { hotelDataKey, hotelPricesKey } from '../utils/redisKeys';
import { logger } from '../utils/logger';

async function clearCityData(city: string): Promise<void> {
  const dataKey = hotelDataKey(city);
  const pricesKey = hotelPricesKey(city);
  await redisClient.del(dataKey, pricesKey);
}

async function writeHotelHash(city: string, hotels: HotelOffer[]): Promise<void> {
  const dataKey = hotelDataKey(city);
  const pipeline = redisClient.pipeline();

  for (const hotel of hotels) {
    pipeline.hset(dataKey, hotel.name, JSON.stringify(hotel));
  }

  await pipeline.exec();
}

async function writeHotelPrices(city: string, hotels: HotelOffer[]): Promise<void> {
  const pricesKey = hotelPricesKey(city);
  const pipeline = redisClient.pipeline();

  for (const hotel of hotels) {
    pipeline.zadd(pricesKey, hotel.price, hotel.name);
  }

  await pipeline.exec();
}

export async function saveHotelsToRedis(city: string, hotels: HotelOffer[]): Promise<void> {
  await clearCityData(city);
  await writeHotelHash(city, hotels);
  await writeHotelPrices(city, hotels);
  logger.info(`Redis: saved ${hotels.length} hotels for city "${city}"`);
}
