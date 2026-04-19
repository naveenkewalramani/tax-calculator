import Decimal from 'decimal.js';
import type { PersonalInfo } from './types';
import type { YearRates } from './rates';

// §51a EStG: Kirchensteuer is computed on a notional ESt that *includes* the
// Kinderfreibetrag — regardless of whether the Günstigerprüfung chose Kindergeld.
// Caller must pass estForKirchensteuer already computed against (zvE − n·Kinderfreibetrag).
export function churchTaxRate(bundesland: PersonalInfo['bundesland'], r: YearRates): number {
  return bundesland === 'BY' || bundesland === 'BW'
    ? r.churchTaxRateBwBy
    : r.churchTaxRateDefault;
}

export function calcKirchensteuer(
  estForKirchensteuer: Decimal,
  personal: PersonalInfo,
  r: YearRates,
): Decimal {
  if (!personal.churchTax) return new Decimal(0);
  return estForKirchensteuer.mul(churchTaxRate(personal.bundesland, r)).toDecimalPlaces(2);
}
