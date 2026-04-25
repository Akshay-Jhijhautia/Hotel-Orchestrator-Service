import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { getSupplierAHotels, getSupplierBHotels } from '../services/supplier.service';
import { AppError } from '../utils/AppError';

export function getSupplierA(req: Request, res: Response): void {
  const city = req.query.city as string | undefined;

  if (!city) {
    throw new AppError('city is required', 400);
  }

  const hotels = getSupplierAHotels(city);
  sendSuccess(res, hotels);
}

export function getSupplierB(req: Request, res: Response): void {
  const city = req.query.city as string | undefined;

  if (!city) {
    throw new AppError('city is required', 400);
  }

  const hotels = getSupplierBHotels(city);
  sendSuccess(res, hotels);
}
