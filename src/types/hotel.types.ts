export interface SupplierHotel {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
}

export interface HotelOffer {
  name: string;
  price: number;
  supplier: 'Supplier A' | 'Supplier B';
  commissionPct: number;
}

export interface HotelQuery {
  city: string;
  minPrice?: number;
  maxPrice?: number;
}
