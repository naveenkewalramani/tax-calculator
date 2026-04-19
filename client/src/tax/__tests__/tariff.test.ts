import { describe, expect, it } from 'vitest';
import { einkommensteuer, einkommensteuerSplitting } from '../tariff';

describe('§32a tariff 2025', () => {
  it('returns 0 at or below Grundfreibetrag', () => {
    expect(einkommensteuer(0, 2025).toNumber()).toBe(0);
    expect(einkommensteuer(12096, 2025).toNumber()).toBe(0);
    expect(einkommensteuer(12095, 2025).toNumber()).toBe(0);
  });

  it('is continuous at zone 2/3 boundary (17,443)', () => {
    const below = einkommensteuer(17443, 2025);
    const above = einkommensteuer(17444, 2025);
    // Continuity: jump should be ≤ marginal rate × 1 € ≈ 0.24 €
    expect(above.minus(below).abs().toNumber()).toBeLessThan(1);
  });

  it('is continuous at zone 3/4 boundary (66,760)', () => {
    const below = einkommensteuer(66760, 2025);
    const above = einkommensteuer(66761, 2025);
    expect(above.minus(below).abs().toNumber()).toBeLessThan(1);
  });

  it('zone 4 is linear at 42 %', () => {
    const a = einkommensteuer(100000, 2025);
    const b = einkommensteuer(100001, 2025);
    expect(b.minus(a).toDecimalPlaces(2).toNumber()).toBeCloseTo(0.42, 2);
  });

  it('zone 5 is linear at 45 %', () => {
    const a = einkommensteuer(300000, 2025);
    const b = einkommensteuer(300001, 2025);
    expect(b.minus(a).toDecimalPlaces(2).toNumber()).toBeCloseTo(0.45, 2);
  });

  it('floors zvE to whole euros before applying tariff', () => {
    expect(einkommensteuer(20000.99, 2025).toNumber()).toBe(
      einkommensteuer(20000, 2025).toNumber(),
    );
  });
});

describe('§32a tariff 2026', () => {
  it('returns 0 at or below 2026 Grundfreibetrag (12,348)', () => {
    expect(einkommensteuer(12348, 2026).toNumber()).toBe(0);
  });

  it('produces lower tax than 2025 for the same zvE (bracket widening)', () => {
    const y25 = einkommensteuer(50000, 2025);
    const y26 = einkommensteuer(50000, 2026);
    expect(y26.lt(y25)).toBe(true);
  });
});

describe('Splittingverfahren', () => {
  it('yields less tax than single assessment in zone 3', () => {
    const single = einkommensteuer(80000, 2025);
    const joint = einkommensteuerSplitting(80000, 2025);
    expect(joint.lt(single)).toBe(true);
  });

  it('equals single × 2 when split half = single zvE', () => {
    // At zvE = 24,000 → each half is 12,000 (below GF), so joint tax = 0
    expect(einkommensteuerSplitting(24000, 2025).toNumber()).toBe(0);
  });
});
