import Decimal from 'decimal.js';
import type { PersonalInfo } from './types';
import type { YearRates } from './rates';

const D = (n: Decimal.Value) => new Decimal(n);

// §55 SGB XI long-term care rate (employee share):
//   childless & over 23 → pflegeBase + pflegeChildlessSurcharge (2.4%)
//   1 child → pflegeBase (1.8%)
//   2-5 children → pflegeBase − (children-1) × pflegeChildReductionPerChild
//   floor 0.5%
export function pflegerateEmployee(children: number, r: YearRates): Decimal {
  if (children === 0) return D(r.pflegeBase).plus(r.pflegeChildlessSurcharge);
  if (children === 1) return D(r.pflegeBase);
  const reduction = D(r.pflegeChildReductionPerChild).mul(Math.min(children - 1, 4));
  return Decimal.max(D(r.pflegeBase).minus(reduction), 0.005);
}

export type SVBreakdown = {
  krankenversicherung: Decimal;
  pflegeversicherung: Decimal;
  rentenversicherung: Decimal;
  arbeitslosenversicherung: Decimal;
  total: Decimal;
};

export function calcSozialversicherung(
  grossEmployment: Decimal,
  personal: PersonalInfo,
  r: YearRates,
): SVBreakdown {
  const kvBase = Decimal.min(grossEmployment, r.bbgHealthCare);
  const rvBase = Decimal.min(grossEmployment, r.bbgPensionUnemployment);
  const kv = kvBase.mul(r.tkHealthTotal).toDecimalPlaces(2);
  const pv = kvBase.mul(pflegerateEmployee(personal.childrenUnder25, r)).toDecimalPlaces(2);
  const rv = rvBase.mul(r.rentenversicherungEmployee).toDecimalPlaces(2);
  const alv = rvBase.mul(r.alvEmployee).toDecimalPlaces(2);
  return {
    krankenversicherung: kv,
    pflegeversicherung: pv,
    rentenversicherung: rv,
    arbeitslosenversicherung: alv,
    total: kv.plus(pv).plus(rv).plus(alv),
  };
}
