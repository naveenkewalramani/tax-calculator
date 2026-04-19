import Decimal from 'decimal.js';
import type { TaxInputs } from './types';
import { ratesFor } from './rates';
import {
  capitalIncome, employmentGross, freelanceNet, otherIncomeTotal,
  rentalNet, tradeIncome,
} from './income';
import { calcSozialversicherung, type SVBreakdown } from './sozialversicherung';
import { effectiveWerbungskosten } from './werbungskosten';
import { calcSonderausgaben } from './sonderausgaben';
import { calcExtraordinary } from './extraordinary';
import { einkommensteuer, einkommensteuerSplitting } from './tariff';
import { runKinderGuenstigerpruefung } from './guenstigerpruefung';
import { calcKirchensteuer } from './kirchensteuer';
import { calcSolz } from './solz';

const D = (n: Decimal.Value) => new Decimal(n);

export type BreakdownStep = {
  label: string;
  amount: number;
  kind: 'add' | 'subtract' | 'total' | 'info';
  note?: string;
};

export type CalculationResult = {
  // Income section
  employmentGross: number;
  freelanceNet: number;
  tradeIncome: number;
  rentalNet: number;
  otherIncome: number;
  capitalGrossIncluded: number; // non-zero only when KAP Günstigerprüfung elected
  gesamtbetrag: number;

  // Deductions
  werbungskostenEffective: number;
  werbungskostenItemised: number;
  werbungskostenUsedPauschbetrag: boolean;
  sozialversicherung: SVBreakdown;
  sonderausgaben: number;
  extraordinary: number;

  // zvE + tariff
  grundfreibetragProrata: number;
  lossOffsetApplied: number;
  zve: number;
  estBase: number; // §32a on zvE

  // Günstigerprüfung
  applyKinderfreibetrag: boolean;
  kinderfreibetragTaxSaving: number;
  kindergeld: number;

  // Final components
  estAfterKinder: number;
  tradeTaxCredit: number;
  estAfterCredits: number;
  solz: number;
  kirchensteuer: number;

  // Capital income (separate Abgeltungsteuer if Günstigerprüfung NOT elected)
  capitalTax: number; // KESt + Soli + KiSt on KESt − foreign credit

  // Grand totals
  totalTax: number; // ESt + Soli + KiSt + Capital tax
  alreadyWithheld: number;
  refundOrPayment: number; // positive = refund
  netTakeHome: number;

  steps: BreakdownStep[];
};

const EMPTY: CalculationResult = {
  employmentGross: 0, freelanceNet: 0, tradeIncome: 0, rentalNet: 0,
  otherIncome: 0, capitalGrossIncluded: 0, gesamtbetrag: 0,
  werbungskostenEffective: 0, werbungskostenItemised: 0, werbungskostenUsedPauschbetrag: true,
  sozialversicherung: {
    krankenversicherung: new Decimal(0), pflegeversicherung: new Decimal(0),
    rentenversicherung: new Decimal(0), arbeitslosenversicherung: new Decimal(0),
    total: new Decimal(0),
  },
  sonderausgaben: 0, extraordinary: 0,
  grundfreibetragProrata: 0, lossOffsetApplied: 0, zve: 0, estBase: 0,
  applyKinderfreibetrag: false, kinderfreibetragTaxSaving: 0, kindergeld: 0,
  estAfterKinder: 0, tradeTaxCredit: 0, estAfterCredits: 0,
  solz: 0, kirchensteuer: 0, capitalTax: 0,
  totalTax: 0, alreadyWithheld: 0, refundOrPayment: 0, netTakeHome: 0,
  steps: [],
};

export function calculate(inputs: TaxInputs): CalculationResult {
  const r = ratesFor(inputs.year);
  const p = inputs.personal;
  const isJoint = p.married && p.jointAssessment;

  // --- 1. Income sources ---
  const empGross = employmentGross(inputs.employment);
  const freelance = freelanceNet(inputs.freelance);
  const trade = tradeIncome(inputs.trade);
  const rental = rentalNet(inputs.rental);
  const other = otherIncomeTotal(inputs.other);
  const cap = capitalIncome(inputs.capital, r, p.churchTax, isJoint);

  const capIncluded = inputs.capital.electGuenstigerpruefung ? cap.grossTotal : D(0);
  const einkunftStreams = empGross.plus(freelance).plus(trade).plus(rental).plus(other);

  // --- 2. Werbungskosten ---
  const wk = effectiveWerbungskosten(inputs.werbungskosten, r);
  const einkunftNSA = empGross.minus(wk.effective);

  // Gesamtbetrag = employment (after Werbungskosten) + other streams + capital if elected
  const gesamtbetrag = einkunftNSA
    .plus(freelance)
    .plus(trade)
    .plus(rental)
    .plus(other)
    .plus(capIncluded);
  const gesamtbetragClamped = Decimal.max(0, gesamtbetrag);

  // --- 3. Social security (employee) ---
  const sv = calcSozialversicherung(empGross, p, r);

  // --- 4. Sonderausgaben ---
  const son = calcSonderausgaben(
    inputs.sonderausgaben, gesamtbetragClamped, isJoint, p.childrenUnder25, r,
  );

  // --- 5. Extraordinary burdens ---
  const ex = calcExtraordinary(inputs.extraordinary, gesamtbetragClamped, p, r);

  // --- 6. Loss offset §10d ---
  const lossApplied = Decimal.min(
    D(inputs.losses.carryForward).plus(inputs.losses.carryBack),
    gesamtbetragClamped,
  );

  // --- 7. Grundfreibetrag pro-rata + zvE ---
  const months = Math.min(Math.max(p.monthsInGermany, 0), 12);
  const gfProrata = D(r.grundfreibetrag).mul(months).div(12).toDecimalPlaces(0);
  const zveRaw = gesamtbetragClamped
    .minus(son.total)
    .minus(ex.total)
    .minus(lossApplied)
    .minus(gfProrata)
    .floor();
  const zve = Decimal.max(0, zveRaw);

  // --- 8. Tariff §32a (with Splittingverfahren if joint) ---
  const estBase = isJoint
    ? einkommensteuerSplitting(zve.toNumber(), inputs.year)
    : einkommensteuer(zve.toNumber(), inputs.year);

  // --- 9a. Kinder-Günstigerprüfung ---
  const kp = runKinderGuenstigerpruefung(
    zve, estBase, p.childrenUnder25, isJoint, inputs.year, r,
  );

  // --- 9b. Trade tax credit §35 ---
  const tradeTaxCredit = Decimal.min(D(inputs.trade.tradeTaxCredit), kp.estAfter);
  const estAfterCredits = Decimal.max(0, kp.estAfter.minus(tradeTaxCredit));

  // --- 10. §51a Kirchensteuer — always computed on ESt with Kinderfreibetrag applied ---
  const kfForKist = D(r.kinderfreibetragTotal)
    .plus(r.bedarfsfreibetragBEA)
    .mul(p.childrenUnder25);
  const zveForKist = Decimal.max(0, zve.minus(kfForKist));
  const estForKist = isJoint
    ? einkommensteuerSplitting(zveForKist.toNumber(), inputs.year)
    : einkommensteuer(zveForKist.toNumber(), inputs.year);
  const kist = calcKirchensteuer(estForKist, p, r);

  // --- 11. Solidaritätszuschlag with Milderungszone ---
  const solz = calcSolz(estAfterCredits, isJoint, r);

  // --- Capital gains tax — only separate if NOT electing Günstigerprüfung ---
  const capTax = inputs.capital.electGuenstigerpruefung ? D(0) : cap.totalTax;

  // --- Final totals ---
  const totalTax = estAfterCredits.plus(solz).plus(kist).plus(capTax);
  const withheld = D(inputs.withholding.lohnsteuer)
    .plus(inputs.withholding.solzWithheld)
    .plus(inputs.withholding.churchTaxWithheld)
    .plus(inputs.withholding.kestWithheld);
  const refund = withheld.minus(totalTax);
  const netTakeHome = empGross.minus(sv.total).minus(estAfterCredits).minus(solz).minus(kist);

  return {
    employmentGross: empGross.toNumber(),
    freelanceNet: freelance.toNumber(),
    tradeIncome: trade.toNumber(),
    rentalNet: rental.toNumber(),
    otherIncome: other.toNumber(),
    capitalGrossIncluded: capIncluded.toNumber(),
    gesamtbetrag: gesamtbetragClamped.toDecimalPlaces(2).toNumber(),
    werbungskostenEffective: wk.effective.toNumber(),
    werbungskostenItemised: wk.itemised.toNumber(),
    werbungskostenUsedPauschbetrag: wk.usedPauschbetrag,
    sozialversicherung: sv,
    sonderausgaben: son.total.toNumber(),
    extraordinary: ex.total.toNumber(),
    grundfreibetragProrata: gfProrata.toNumber(),
    lossOffsetApplied: lossApplied.toNumber(),
    zve: zve.toNumber(),
    estBase: estBase.toNumber(),
    applyKinderfreibetrag: kp.applyKinderfreibetrag,
    kinderfreibetragTaxSaving: kp.taxSaving.toNumber(),
    kindergeld: kp.kindergeld.toNumber(),
    estAfterKinder: kp.estAfter.toNumber(),
    tradeTaxCredit: tradeTaxCredit.toNumber(),
    estAfterCredits: estAfterCredits.toNumber(),
    solz: solz.toNumber(),
    kirchensteuer: kist.toNumber(),
    capitalTax: capTax.toNumber(),
    totalTax: totalTax.toDecimalPlaces(2).toNumber(),
    alreadyWithheld: withheld.toNumber(),
    refundOrPayment: refund.toDecimalPlaces(2).toNumber(),
    netTakeHome: netTakeHome.toDecimalPlaces(2).toNumber(),
    steps: buildSteps({
      gesamtbetragClamped, wk, son, ex, gfProrata, lossApplied, zve, estBase,
      kp, tradeTaxCredit, estAfterCredits, solz, kist, capTax, totalTax, withheld, refund,
    }),
  };
}

export const __emptyResult = EMPTY;

type StepCtx = {
  gesamtbetragClamped: Decimal;
  wk: ReturnType<typeof effectiveWerbungskosten>;
  son: ReturnType<typeof calcSonderausgaben>;
  ex: ReturnType<typeof calcExtraordinary>;
  gfProrata: Decimal;
  lossApplied: Decimal;
  zve: Decimal;
  estBase: Decimal;
  kp: ReturnType<typeof runKinderGuenstigerpruefung>;
  tradeTaxCredit: Decimal;
  estAfterCredits: Decimal;
  solz: Decimal;
  kist: Decimal;
  capTax: Decimal;
  totalTax: Decimal;
  withheld: Decimal;
  refund: Decimal;
};

function buildSteps(c: StepCtx): BreakdownStep[] {
  const steps: BreakdownStep[] = [
    { label: 'Gesamtbetrag der Einkünfte', amount: c.gesamtbetragClamped.toDecimalPlaces(2).toNumber(), kind: 'total' },
    {
      label: '− Werbungskosten',
      amount: c.wk.effective.toNumber(),
      kind: 'subtract',
      note: c.wk.usedPauschbetrag ? 'Arbeitnehmer-Pauschbetrag applied (higher than itemised)' : 'Itemised',
    },
    { label: '− Sonderausgaben', amount: c.son.total.toNumber(), kind: 'subtract' },
    { label: '− Außergewöhnliche Belastungen', amount: c.ex.total.toNumber(), kind: 'subtract' },
    { label: '− Verlustabzug §10d', amount: c.lossApplied.toNumber(), kind: 'subtract' },
    { label: '− Grundfreibetrag (pro-rata)', amount: c.gfProrata.toNumber(), kind: 'subtract' },
    { label: 'Zu versteuerndes Einkommen (zvE)', amount: c.zve.toNumber(), kind: 'total' },
    { label: 'Einkommensteuer (§32a)', amount: c.estBase.toNumber(), kind: 'info' },
  ];
  if (c.kp.applyKinderfreibetrag) {
    steps.push({
      label: '− Kinderfreibetrag (Günstigerprüfung)',
      amount: c.kp.taxSaving.toNumber(),
      kind: 'subtract',
      note: `Saves more tax (${c.kp.taxSaving.toFixed(2)} €) than Kindergeld (${c.kp.kindergeld.toFixed(2)} €)`,
    });
  } else if (c.kp.kindergeld.gt(0)) {
    steps.push({
      label: 'Kindergeld (more beneficial than Kinderfreibetrag)',
      amount: c.kp.kindergeld.toNumber(),
      kind: 'info',
    });
  }
  if (c.tradeTaxCredit.gt(0)) {
    steps.push({ label: '− Gewerbesteuer-Anrechnung §35', amount: c.tradeTaxCredit.toNumber(), kind: 'subtract' });
  }
  steps.push(
    { label: '+ Solidaritätszuschlag', amount: c.solz.toNumber(), kind: 'add' },
    { label: '+ Kirchensteuer', amount: c.kist.toNumber(), kind: 'add' },
  );
  if (c.capTax.gt(0)) {
    steps.push({
      label: '+ Kapitalertragsteuer (Abgeltungsteuer)',
      amount: c.capTax.toNumber(),
      kind: 'add',
      note: 'Separate 25 % flat tax on capital income',
    });
  }
  steps.push(
    { label: 'Gesamte Steuerlast', amount: c.totalTax.toDecimalPlaces(2).toNumber(), kind: 'total' },
    { label: '− Bereits einbehalten', amount: c.withheld.toNumber(), kind: 'subtract' },
    {
      label: c.refund.gte(0) ? 'Erstattung (refund)' : 'Nachzahlung (additional payment)',
      amount: Math.abs(c.refund.toDecimalPlaces(2).toNumber()),
      kind: 'total',
    },
  );
  return steps;
}
