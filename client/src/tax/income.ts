import Decimal from 'decimal.js';
import type {
  CapitalInput, EmploymentInput, FreelanceInput, Monthly,
  OtherIncomeInput, RentalInput, TradeInput,
} from './types';
import type { YearRates } from './rates';

const D = (n: number) => new Decimal(n);
const sumMonthly = (m: Monthly) =>
  Object.values(m).reduce<Decimal>((acc, v) => acc.plus(v), D(0));

export function employmentGross(e: EmploymentInput): Decimal {
  return sumMonthly(e.primary)
    .plus(sumMonthly(e.secondary))
    .plus(sumMonthly(e.severance))
    .plus(sumMonthly(e.bonus));
}

export function freelanceNet(f: FreelanceInput): Decimal {
  return Decimal.max(0, D(f.revenue).minus(f.expenses));
}

export function tradeIncome(t: TradeInput): Decimal {
  return D(t.profit);
}

export function rentalNet(r: RentalInput): Decimal {
  // Losses allowed to offset other income (§21 EStG, subject to §15b restrictions ignored here)
  return D(r.grossRent)
    .minus(r.mortgageInterest)
    .minus(r.depreciation)
    .minus(r.maintenance)
    .minus(r.mgmtInsuranceTax)
    .minus(r.otherExpenses);
}

export function otherIncomeTotal(o: OtherIncomeInput): Decimal {
  return D(o.statutoryPension)
    .plus(o.privateAnnuity)
    .plus(o.maintenanceReceived)
    .plus(o.speculationGains)
    .plus(o.cryptoGains)
    .plus(o.miscOther);
}

export type CapitalBreakdown = {
  grossTotal: Decimal;
  sparerPauschbetragApplied: Decimal;
  taxable: Decimal;
  abgeltungsteuer: Decimal;
  soli: Decimal;
  churchTax: Decimal;
  foreignCredit: Decimal;
  totalTax: Decimal; // ESt + Soli + church - foreign credit
};

export function capitalIncome(
  c: CapitalInput,
  r: YearRates,
  hasChurchTax: boolean,
  isJoint: boolean,
): CapitalBreakdown {
  const gross = D(c.dividendsDE)
    .plus(c.dividendsForeign)
    .plus(c.interest)
    .plus(c.etfDistributions)
    .plus(c.realisedGains)
    .minus(c.lossesOffset);
  const grossClamped = Decimal.max(0, gross);
  const spAllow = D(r.sparerPauschbetrag).mul(isJoint ? 2 : 1);
  const spApplied = Decimal.min(grossClamped, spAllow);
  const taxable = Decimal.max(0, grossClamped.minus(spApplied));
  const abgeltung = taxable.mul(r.abgeltungsteuerRate).toDecimalPlaces(2);
  const soli = abgeltung.mul(r.abgeltungsteuerSolz).toDecimalPlaces(2);
  // Church tax on KESt uses the reduced KESt formula (25 / (4 + Kist_rate)), but the
  // spreadsheet approximates as ESt × rate; keep the simpler form for now.
  const ksRate = hasChurchTax ? r.churchTaxRateDefault : 0;
  const churchTax = abgeltung.mul(ksRate).toDecimalPlaces(2);
  const foreignCredit = Decimal.min(abgeltung, D(c.foreignWithholding));
  const totalTax = abgeltung.plus(soli).plus(churchTax).minus(foreignCredit);
  return {
    grossTotal: grossClamped,
    sparerPauschbetragApplied: spApplied,
    taxable,
    abgeltungsteuer: abgeltung,
    soli,
    churchTax,
    foreignCredit,
    totalTax: totalTax.toDecimalPlaces(2),
  };
}
