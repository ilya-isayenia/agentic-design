import { describe, expect, it } from 'vitest';
import { matchClubs, mockFlags } from './api';

describe('club search', () => {
  it('returns all clubs for an empty query', () => {
    expect(matchClubs('').length).toBeGreaterThan(5);
  });
  it('matches town names case-insensitively', () => {
    expect(matchClubs('BELMAR').every((c) => c.cityId === 'belmar')).toBe(true);
  });
  it('matches postcodes ignoring spaces', () => {
    expect(matchClubs('ar10').map((c) => c.id)).toEqual(['arden-north', 'arden-harbour']);
  });
  it('returns nothing for nonsense', () => {
    expect(matchClubs('zzz')).toEqual([]);
  });
  it('reads mock flags from the query string', () => {
    expect([...mockFlags('?mock=error,slow')]).toEqual(['error', 'slow']);
  });
});
