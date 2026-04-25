import { SupplierHotel } from '../types/hotel.types';
import { supplierAHotels } from '../mocks/supplierA.mock';
import { supplierBHotels } from '../mocks/supplierB.mock';

export function getSupplierAHotels(city: string): SupplierHotel[] {
  return supplierAHotels.filter(
    (hotel) => hotel.city.toLowerCase() === city.toLowerCase(),
  );
}

export function getSupplierBHotels(city: string): SupplierHotel[] {
  return supplierBHotels.filter(
    (hotel) => hotel.city.toLowerCase() === city.toLowerCase(),
  );
}
