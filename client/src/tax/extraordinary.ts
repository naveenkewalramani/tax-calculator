import Decimal from 'decimal.js';
import type { ExtraordinaryInput, PersonalInfo } from './types';
import type { YearRates } from './rates';

const D = (n: Decimal.Value) => new Decimal(n);

// §33 Abs.3 EStG — zumutbare Belastung, true 3-tier progressive formula.
// Tier boundaries: 15,340 and 51,130.
// Rates depend on filing status and number of children:
//   (A) Single, no child               5% / 6% / 7%
//   (B) Joint, no child                4% / 5% / 6%
//   (C) 1–2 children (any filing)      2% / 3% / 4%
//   (D) 3+ children (any filing)       1% / 1% / 2%
const TIER1 = 15340;
const TIER2 = 51130;

type ZBRates = [number, number, number];
function zbRates(isJoint: boolean, numChildren: number): ZBRates {
  if (numChildren >= 3) return [0.01, 0.01, 0.02];
  if (numChildren >= 1) return [0.02, 0.03, 0.04];
  if (isJoint) return [0.04, 0.05, 0.06];
  return [0.05, 0.06, 0.07];
}

export function zumutbareBelastung(
  gesamtbetrag: Decimal,
  isJoint: boolean,
  numChildren: number,
): Decimal {
  const [r1, r2, r3] = zbRates(isJoint, numChildren);
  const t1 = Decimal.min(gesamtbetrag, TIER1);
  const t2 = Decimal.max(0, Decimal.min(gesamtbetrag, TIER2).minus(TIER1));
  const t3 = Decimal.max(0, gesamtbetrag.minus(TIER2));
  return t1.mul(r1).plus(t2.mul(r2)).plus(t3.mul(r3)).toDecimalPlaces(2);
}

export function behindertenPauschbetrag(gdB: number, r: YearRates): Decimal {
  return D(r.behindertenPauschbetrag[gdB] ?? 0);
}

export function blindenPauschbetrag(isBlindOrSevereCare: boolean, r: YearRates): Decimal {
  return isBlindOrSevereCare ? D(r.blindenPauschbetrag) : D(0);
}

export type ExtraordinaryBreakdown = {
  itemisedGross: Decimal;
  zumutbareBelastung: Decimal;
  section33Net: Decimal;
  behinderten: Decimal;
  blinden: Decimal;
  pflegepauschbetrag: Decimal;
  total: Decimal;
};

export function calcExtraordinary(
  e: ExtraordinaryInput,
  gesamtbetrag: Decimal,
  personal: PersonalInfo,
  r: YearRates,
): ExtraordinaryBreakdown {
  const itemisedGross = D(e.medicalCosts)
    .plus(e.funeralCosts)
    .plus(e.disasterCosts)
    .plus(e.careCosts)
    .plus(e.other);
  const isJoint = personal.married && personal.jointAssessment;
  const zb = zumutbareBelastung(gesamtbetrag, isJoint, personal.childrenUnder25);
  const s33 = Decimal.max(0, itemisedGross.minus(zb));
  const bp = behindertenPauschbetrag(personal.disabilityGdB, r);
  const blp = blindenPauschbetrag(personal.blindOrSevereCare, r);
  const pp = D(e.pflegepauschbetrag);
  return {
    itemisedGross,
    zumutbareBelastung: zb,
    section33Net: s33,
    behinderten: bp,
    blinden: blp,
    pflegepauschbetrag: pp,
    total: s33.plus(bp).plus(blp).plus(pp).toDecimalPlaces(2),
  };
}
