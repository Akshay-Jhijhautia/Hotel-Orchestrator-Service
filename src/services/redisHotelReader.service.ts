import { redisClient } from '../config/redis';
import { HotelOffer } from '../types/hotel.types';
import { hotelDataKey, hotelPricesKey } from '../utils/redisKeys';

function parseHotelOffer(raw: string): HotelOffer {
  return JSON.parse(raw) as HotelOffer;
}

export async function cityDataExists(city: string): Promise<boolean> {
  const count = await redisClient.hlen(hotelDataKey(city));
  return count > 0;
}

export async function getAllHotelsFromRedis(city: string): Promise<HotelOffer[]> {
  const data = await redisClient.hgetall(hotelDataKey(city));
  return Object.values(data).map(parseHotelOffer);
}

export async function getHotelsByPriceRange(
  city: string,
  minPrice: number,
  maxPrice: number,
): Promise<HotelOffer[]> {
  const pricesKey = hotelPricesKey(city);
  const dataKey = hotelDataKey(city);

  const hotelNames = await redisClient.zrangebyscore(pricesKey, minPrice, maxPrice);

  if (hotelNames.length === 0) {
    return [];
  }

  const rawHotels = await redisClient.hmget(dataKey, ...hotelNames);

  return rawHotels
    .filter((raw): raw is string => raw !== null)
    .map(parseHotelOffer);
}
