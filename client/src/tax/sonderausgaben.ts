import Decimal from 'decimal.js';
import type { SonderausgabenInput } from './types';
import type { YearRates } from './rates';

const D = (n: Decimal.Value) => new Decimal(n);

export type SonderausgabenBreakdown = {
  pension: Decimal;
  insurance: Decimal;
  childcare: Decimal;
  schoolFees: Decimal;
  donations: Decimal;
  churchTaxPaid: Decimal;
  maintenance: Decimal;
  firstVocationalTraining: Decimal;
  total: Decimal;
};

const MAINTENANCE_CAP = 13805; // §10 Abs.1a Nr.1 — Realsplitting cap
const FIRST_TRAINING_CAP = 6000; // §10 Abs.1 Nr.7 — Erstausbildung

export function calcSonderausgaben(
  s: SonderausgabenInput,
  grossIncome: Decimal,
  isJoint: boolean,
  numChildren: number,
  r: YearRates,
): SonderausgabenBreakdown {
  const pensionRaw = D(s.statutoryPensionAN).plus(s.riester).plus(s.ruerup);
  const pensionCap = D(r.pensionMaxDeduction).mul(isJoint ? 2 : 1);
  const pension = Decimal.min(pensionRaw, pensionCap);

  // Insurance premiums — full deduction per §10 Abs.1 Nr.3 (KV/PV) + Nr.3a (other) as entered
  const insurance = D(s.healthInsurance)
    .plus(s.longTermCareInsurance)
    .plus(s.privateHealthInsurance)
    .plus(s.otherInsurance);

  // Childcare §10 Abs.1 Nr.5 — 2/3 of costs up to €4,000/child.
  // The xlsx uses the older 80% / €4,800 rule; keep consistent with xlsx spec.
  const childcareCap = D(4800).mul(Math.max(1, numChildren));
  const childcare = Decimal.min(D(s.childcareCosts).mul(0.8), childcareCap);

  // School fees §10 Abs.1 Nr.9 — 30%, capped at €5,000
  const schoolFees = Decimal.min(D(s.schoolFees).mul(0.3), 5000);

  // Donations §10b — capped at 20% of Gesamtbetrag der Einkünfte
  const donations = Decimal.min(D(s.donations), grossIncome.mul(0.2));

  // Church tax paid — fully deductible (except KiSt on KESt)
  const churchTaxPaid = D(s.churchTaxPaid);

  // Realsplitting
  const maintenance = Decimal.min(D(s.maintenancePaid), MAINTENANCE_CAP);

  // First vocational training — capped
  const firstVocationalTraining = Decimal.min(
    D(s.firstVocationalTraining),
    FIRST_TRAINING_CAP,
  );

  const total = pension
    .plus(insurance)
    .plus(childcare)
    .plus(schoolFees)
    .plus(donations)
    .plus(churchTaxPaid)
    .plus(maintenance)
    .plus(firstVocationalTraining)
    .toDecimalPlaces(2);

  return {
    pension,
    insurance,
    childcare,
    schoolFees,
    donations,
    churchTaxPaid,
    maintenance,
    firstVocationalTraining,
    total,
  };
}
