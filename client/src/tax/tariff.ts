// §32a EStG — 5-zone income tax tariff. Also Splittingverfahren for joint filers.
// Uses decimal.js so quadratic zones don't accumulate IEEE-754 drift.
import Decimal from 'decimal.js';
import { ratesFor } from './rates';
import type { TaxYear } from './types';

Decimal.set({ precision: 40 });

export function einkommensteuer(zveEuros: number, year: TaxYear): Decimal {
  const r = ratesFor(year);
  const zve = new Decimal(zveEuros).floor(); // §32a rounds zvE down to whole euros
  if (zve.lte(r.grundfreibetrag)) return new Decimal(0);

  const t = r.tariff;
  if (zve.lte(r.zone2Upper)) {
    const y = zve.minus(r.grundfreibetrag).div(10000);
    return y.mul(t.z2_a).plus(t.z2_b).mul(y).toDecimalPlaces(2);
  }
  if (zve.lte(r.zone3Upper)) {
    const z = zve.minus(r.zone2Upper).div(10000);
    return z.mul(t.z3_a).plus(t.z3_b).mul(z).plus(t.z3_c).toDecimalPlaces(2);
  }
  if (zve.lte(r.reichensteuerThreshold)) {
    return zve.mul(r.topRate).minus(t.z4_const).toDecimalPlaces(2);
  }
  return zve.mul(r.reichensteuerRate).minus(t.z5_const).toDecimalPlaces(2);
}

// §32a Abs.5 Splittingverfahren: 2 × E(zvE / 2)
export function einkommensteuerSplitting(zveEuros: number, year: TaxYear): Decimal {
  return einkommensteuer(zveEuros / 2, year).mul(2);
}
