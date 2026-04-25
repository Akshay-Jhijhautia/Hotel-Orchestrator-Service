import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { HotelQuery } from '../types/hotel.types';
import { startHotelOfferWorkflow } from '../services/hotelWorkflow.service';

function parseHotelQuery(req: Request): HotelQuery {
  const city = req.query.city as string | undefined;

  if (!city || city.trim() === '') {
    throw new AppError('city is required', 400);
  }

  const query: HotelQuery = { city: city.trim().toLowerCase() };

  if (req.query.minPrice !== undefined) {
    const minPrice = Number(req.query.minPrice);
    if (isNaN(minPrice) || minPrice < 0) {
      throw new AppError('minPrice must be a valid non-negative number', 400);
    }
    query.minPrice = minPrice;
  }

  if (req.query.maxPrice !== undefined) {
    const maxPrice = Number(req.query.maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) {
      throw new AppError('maxPrice must be a valid non-negative number', 400);
    }
    query.maxPrice = maxPrice;
  }

  if (query.minPrice !== undefined && query.maxPrice !== undefined) {
    if (query.minPrice > query.maxPrice) {
      throw new AppError('minPrice cannot be greater than maxPrice', 400);
    }
  }

  return query;
}

export async function getHotels(req: Request, res: Response): Promise<void> {
  const query = parseHotelQuery(req);

  const hotels = await startHotelOfferWorkflow(query.city);
  sendSuccess(res, hotels);
}
