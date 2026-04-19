import Decimal from 'decimal.js';
import type { YearRates } from './rates';

// §4 SolZG 1995 — Milderungszone:
//   ESt ≤ exempt limit → no SolZ
//   Above: min(5.5% × ESt, 11.9% × (ESt − exempt limit))
// Joint filers double the exempt limit.
export function calcSolz(est: Decimal, isJoint: boolean, r: YearRates): Decimal {
  const exempt = new Decimal(r.solzExemptionEstLimit).mul(isJoint ? 2 : 1);
  if (est.lte(exempt)) return new Decimal(0);
  const cap = est.mul(r.solzRate);
  const milderung = est.minus(exempt).mul(0.119);
  return Decimal.min(cap, milderung).toDecimalPlaces(2);
}
