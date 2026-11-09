// Prices and promo rules. Described in docs/product/pricing.md; change both together.
// All money is in cents for a 4-week period.

export type MembershipTypeId = 'regular' | 'student' | 'corporate';
export type AccessLevelId = 'home' | 'area' | 'city' | 'country';
export type DurationId = 'two-years' | 'one-year' | 'flex';

export interface MembershipType {
  id: MembershipTypeId;
  title: string;
  description: string;
  /** Multiplier on the base price. */
  factor: number;
}

export interface AccessLevel {
  id: AccessLevelId;
  title: string;
  perks: string[];
  /** Base price for a regular member on the two-year plan, before promo. */
  base: number;
}

export interface Duration {
  id: DurationId;
  title: string;
  perks: string[];
  /** Multiplier on the base price. */
  factor: number;
  /** Promo: share of the price taken off during the first `months` months. */
  promo?: { off: number; months: number; label: string };
  starterFree: boolean;
}

export const MEMBERSHIP_TYPES: MembershipType[] = [
  { id: 'regular', title: 'Regular', description: 'For anyone 16 or older', factor: 1 },
  { id: 'student', title: 'Student', description: 'With a valid student card, checked at the club', factor: 0.8 },
  { id: 'corporate', title: 'Corporate', description: 'Through an employer on the partner list', factor: 0.85 },
];

export const ACCESS_LEVELS: AccessLevel[] = [
  { id: 'home', title: 'Home club', perks: ['Train at the club you picked', 'All its classes and equipment'], base: 4400 },
  { id: 'area', title: 'Area', perks: ['Every club in the area', 'Book classes at any of them'], base: 5600 },
  { id: 'city', title: 'City', perks: ['Every club in the city', 'Bring a friend once a month'], base: 6800 },
  { id: 'country', title: 'Country', perks: ['Every club in the country', 'Bring a friend every week'], base: 8000 },
];

export const DURATIONS: Duration[] = [
  { id: 'two-years', title: '2 years', perks: ['Lowest 4-week price', 'Starter package included'], factor: 1, promo: { off: 0.5, months: 6, label: 'Half price for 6 months' }, starterFree: true },
  { id: 'one-year', title: '1 year', perks: ['Balance of price and freedom', 'Starter package included'], factor: 1.1, promo: { off: 0.5, months: 6, label: 'Half price for 6 months' }, starterFree: true },
  { id: 'flex', title: 'Flex', perks: ['Cancel any month', 'Change your plan any time'], factor: 1.35, starterFree: false },
];

export const STARTER_PACKAGE = { title: 'Starter package', price: 2500, includes: ['Intro session with a coach', 'Member card', 'Water bottle'] };

/** The workouts-per-week stepper range on the access level step. */
export const WORKOUTS_PER_WEEK = { min: 0, max: 7 };
