import { SupplierHotel, HotelOffer } from '../types/hotel.types';

function toHotelOffer(hotel: SupplierHotel, supplier: HotelOffer['supplier']): HotelOffer {
  return {
    name: hotel.name,
    price: hotel.price,
    supplier,
    commissionPct: hotel.commissionPct,
  };
}

function selectCheaperOffer(offerA: HotelOffer, offerB: HotelOffer): HotelOffer {
  return offerA.price <= offerB.price ? offerA : offerB;
}

export function dedupeAndSelectBest(
  supplierAHotels: SupplierHotel[],
  supplierBHotels: SupplierHotel[],
): HotelOffer[] {
  const offerMap = new Map<string, HotelOffer>();

  for (const hotel of supplierAHotels) {
    offerMap.set(hotel.name, toHotelOffer(hotel, 'Supplier A'));
  }

  for (const hotel of supplierBHotels) {
    const existing = offerMap.get(hotel.name);
    const newOffer = toHotelOffer(hotel, 'Supplier B');

    if (existing) {
      offerMap.set(hotel.name, selectCheaperOffer(existing, newOffer));
    } else {
      offerMap.set(hotel.name, newOffer);
    }
  }

  return Array.from(offerMap.values());
}
