import { describe, expect, it } from 'vitest';
import { ratesFor } from '../rates';
import { commutingAllowance, homeOfficePauschale, internetDeduction } from '../werbungskosten';

describe('commutingAllowance', () => {
  it('applies 30¢/km only within the first 20 km (2025)', () => {
    const r = ratesFor(2025);
    // 8 km × 200 days × 0.30 = 480
    expect(commutingAllowance(8, 200, r).toNumber()).toBeCloseTo(480, 2);
  });

  it('blends tiers for commutes over 20 km (2025)', () => {
    const r = ratesFor(2025);
    // 200 × (20×0.30 + 10×0.38) = 200 × (6 + 3.8) = 1960
    expect(commutingAllowance(30, 200, r).toNumber()).toBeCloseTo(1960, 2);
  });

  it('uses flat 38¢/km from km 1 in 2026', () => {
    const r = ratesFor(2026);
    expect(commutingAllowance(30, 200, r).toNumber()).toBeCloseTo(30 * 200 * 0.38, 2);
    expect(commutingAllowance(8, 200, r).toNumber()).toBeCloseTo(8 * 200 * 0.38, 2);
  });
});

describe('homeOfficePauschale', () => {
  it('caps at 210 days × €6', () => {
    const r = ratesFor(2025);
    expect(homeOfficePauschale(210, r).toNumber()).toBe(1260);
    expect(homeOfficePauschale(300, r).toNumber()).toBe(1260);
    expect(homeOfficePauschale(100, r).toNumber()).toBe(600);
  });
});

describe('internetDeduction', () => {
  it('is MIN(20 % of bill, €20) × 12', () => {
    const r = ratesFor(2025);
    // €50/mo → 20 % = €10 → under cap → 10 × 12 = 120
    expect(internetDeduction(50, r).toNumber()).toBeCloseTo(120, 2);
    // €200/mo → 20 % = €40 → cap €20 → 20 × 12 = 240
    expect(internetDeduction(200, r).toNumber()).toBeCloseTo(240, 2);
  });
});
