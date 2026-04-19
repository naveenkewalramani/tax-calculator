import Decimal from 'decimal.js';
import type { YearRates } from './rates';
import { einkommensteuer, einkommensteuerSplitting } from './tariff';
import type { TaxYear } from './types';

// §31 EStG: compare tax saving from Kinderfreibetrag vs. Kindergeld received.
// Apply whichever is more beneficial. Kinderfreibetrag = total €6,384 × n children
// (already for both parents combined). In joint assessment, full amount applies.
// In single assessment (married filing separately, or unmarried), half is applied per parent.
export type KinderResult = {
  applyKinderfreibetrag: boolean;
  taxSaving: Decimal;
  kindergeld: Decimal;
  kinderfreibetragUsed: Decimal;
  estAfter: Decimal;
};

export function runKinderGuenstigerpruefung(
  zveEuros: Decimal,
  estBefore: Decimal,
  numChildren: number,
  isJoint: boolean,
  year: TaxYear,
  r: YearRates,
): KinderResult {
  if (numChildren <= 0) {
    return {
      applyKinderfreibetrag: false,
      taxSaving: new Decimal(0),
      kindergeld: new Decimal(0),
      kinderfreibetragUsed: new Decimal(0),
      estAfter: estBefore,
    };
  }
  // §31 EStG Günstigerprüfung compares tax saved by BOTH Kinderfreibetrag AND
  // Bedarfsfreibetrag (BEA) combined against Kindergeld received.
  const kfPerChildBase = new Decimal(r.kinderfreibetragTotal).plus(r.bedarfsfreibetragBEA);
  // Single filers claim their half unless they have sole custody; the simulator
  // treats the declared children as fully attributable to the user.
  const kfPerChild = kfPerChildBase.mul(isJoint ? 1 : 1);
  const kfTotal = kfPerChild.mul(numChildren);
  const zveWithKF = Decimal.max(0, zveEuros.minus(kfTotal));
  const estWithKF = isJoint
    ? einkommensteuerSplitting(zveWithKF.toNumber(), year)
    : einkommensteuer(zveWithKF.toNumber(), year);
  const taxSaving = estBefore.minus(estWithKF);
  const kindergeld = new Decimal(r.kindergeldMonthly).mul(12).mul(numChildren);
  const apply = taxSaving.gt(kindergeld);
  return {
    applyKinderfreibetrag: apply,
    taxSaving,
    kindergeld,
    kinderfreibetragUsed: kfTotal,
    estAfter: apply ? estWithKF : estBefore,
  };
}
