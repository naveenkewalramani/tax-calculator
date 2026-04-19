import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { ratesFor } from '../rates';
import { calcSolz } from '../solz';

const r = ratesFor(2025);

describe('Solidaritätszuschlag 2025', () => {
  it('is zero at or below the exemption threshold (ESt = 19,950)', () => {
    expect(calcSolz(new Decimal(19950), false, r).toNumber()).toBe(0);
    expect(calcSolz(new Decimal(10000), false, r).toNumber()).toBe(0);
  });

  it('ramps up in the Milderungszone just above the threshold', () => {
    // ESt = 20,000 → min(0.055·20000, 0.119·50) = min(1100, 5.95) = 5.95
    expect(calcSolz(new Decimal(20000), false, r).toNumber()).toBeCloseTo(5.95, 2);
  });

  it('caps at the 5.5 % rate once Milderungszone exits', () => {
    // At ESt large enough, min picks 5.5 %
    const v = calcSolz(new Decimal(100000), false, r);
    expect(v.toNumber()).toBeCloseTo(5500, 2);
  });

  it('doubles the exempt limit for joint filers', () => {
    // ESt = 39,900 still exempt for joint, but not for single
    expect(calcSolz(new Decimal(39900), true, r).toNumber()).toBe(0);
    expect(calcSolz(new Decimal(39900), false, r).toNumber()).toBeCloseTo(39900 * 0.055, 1);
  });
});
