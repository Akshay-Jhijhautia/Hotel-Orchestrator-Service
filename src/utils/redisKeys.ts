const PREFIX = 'hotels';

export function hotelDataKey(city: string): string {
  return `${PREFIX}:${city.toLowerCase()}:data`;
}

export function hotelPricesKey(city: string): string {
  return `${PREFIX}:${city.toLowerCase()}:prices`;
}
