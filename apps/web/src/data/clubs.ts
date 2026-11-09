// Invented clubs in invented towns. Nothing here is a real place or address.
export interface City {
  id: string;
  name: string;
  /** Position on the abstract map, in a 100 × 60 grid. */
  x: number;
  y: number;
}

export interface Club {
  id: string;
  name: string;
  cityId: string;
  area: string;
  street: string;
  postcode: string;
  perks: string[];
  /** Promo text shown as a ribbon on the card, if the club has one. */
  ribbon?: string;
}

export const COUNTRY = 'Demoland';

export const CITIES: City[] = [
  { id: 'arden', name: 'Arden', x: 30, y: 22 },
  { id: 'belmar', name: 'Belmar', x: 68, y: 14 },
  { id: 'corvel', name: 'Corvel', x: 52, y: 40 },
  { id: 'dunmore', name: 'Dunmore', x: 18, y: 48 },
];

const PROMO = 'Half price for 6 months';

export const CLUBS: Club[] = [
  { id: 'arden-north', name: 'Arden North', cityId: 'arden', area: 'Arden North', street: '12 Sample Street', postcode: 'AR 1010', perks: ['Towels included', 'Sauna', 'Free water'], ribbon: PROMO },
  { id: 'arden-harbour', name: 'Arden Harbour', cityId: 'arden', area: 'Arden North', street: '3 Example Quay', postcode: 'AR 1022', perks: ['Pool', 'Recovery zone'], ribbon: PROMO },
  { id: 'arden-elm-park', name: 'Arden Elm Park', cityId: 'arden', area: 'Arden South', street: '88 Placeholder Lane', postcode: 'AR 1105', perks: ['Group classes', 'Free water'] },
  { id: 'arden-southmoor', name: 'Arden Southmoor', cityId: 'arden', area: 'Arden South', street: '41 Mock Road', postcode: 'AR 1130', perks: ['Open 24/7', 'Towels included'] },
  { id: 'arden-old-mill', name: 'Arden Old Mill', cityId: 'arden', area: 'Arden South', street: '7 Fixture Yard', postcode: 'AR 1144', perks: ['Climbing wall', 'Sauna', 'Cafe'], ribbon: PROMO },
  { id: 'belmar-central', name: 'Belmar Central', cityId: 'belmar', area: 'Belmar', street: '200 Demo Avenue', postcode: 'BE 2001', perks: ['Pool', 'Sauna', 'Open 24/7'], ribbon: PROMO },
  { id: 'belmar-westbrook', name: 'Belmar Westbrook', cityId: 'belmar', area: 'Belmar', street: '15 Stub Street', postcode: 'BE 2040', perks: ['Group classes'] },
  { id: 'belmar-hillcrest', name: 'Belmar Hillcrest', cityId: 'belmar', area: 'Belmar', street: '9 Trial Terrace', postcode: 'BE 2077', perks: ['Recovery zone', 'Free water'] },
  { id: 'corvel-lakeside', name: 'Corvel Lakeside', cityId: 'corvel', area: 'Corvel', street: '60 Dummy Drive', postcode: 'CO 3015', perks: ['Pool', 'Cafe', 'Towels included'], ribbon: PROMO },
  { id: 'corvel-station', name: 'Corvel Station', cityId: 'corvel', area: 'Corvel', street: '1 Specimen Square', postcode: 'CO 3002', perks: ['Open 24/7'] },
  { id: 'dunmore-kingsfield', name: 'Dunmore Kingsfield', cityId: 'dunmore', area: 'Dunmore', street: '33 Pretend Parade', postcode: 'DU 4050', perks: ['Group classes', 'Sauna'] },
];

export function cityOf(club: Club): City {
  const city = CITIES.find((c) => c.id === club.cityId);
  if (!city) throw new Error(`Unknown city ${club.cityId}`);
  return city;
}

export function addressOf(club: Club): string {
  return `${club.street}, ${club.postcode} ${cityOf(club).name}`;
}
