import { describe, expect, it } from 'vitest';
import { calculate } from '../calculator';
import { emptyMonthly, type TaxInputs } from '../types';

const fillMonthly = (amount: number) => {
  const m = emptyMonthly();
  (Object.keys(m) as (keyof typeof m)[]).forEach((k) => (m[k] = amount));
  return m;
};

const baseInputs = (overrides: Partial<TaxInputs> = {}): TaxInputs => ({
  year: 2025,
  personal: {
    steuerklasse: 1, churchTax: false, childrenUnder25: 0,
    disabilityGdB: 0, blindOrSevereCare: false,
    monthsInGermany: 12, married: false, jointAssessment: false,
    bundesland: 'OTHER',
  },
  employment: {
    primary: emptyMonthly(), secondary: emptyMonthly(),
    severance: emptyMonthly(), bonus: emptyMonthly(),
    employerReimbursements: 0,
  },
  freelance: { revenue: 0, expenses: 0 },
  trade: { profit: 0, tradeTaxCredit: 0 },
  rental: {
    grossRent: 0, mortgageInterest: 0, depreciation: 0,
    maintenance: 0, mgmtInsuranceTax: 0, otherExpenses: 0,
  },
  capital: {
    dividendsDE: 0, dividendsForeign: 0, interest: 0,
    etfDistributions: 0, realisedGains: 0, lossesOffset: 0,
    foreignWithholding: 0, electGuenstigerpruefung: false,
  },
  other: {
    statutoryPension: 0, privateAnnuity: 0, maintenanceReceived: 0,
    speculationGains: 0, cryptoGains: 0, miscOther: 0,
  },
  werbungskosten: {
    commutingKm: 0, commutingDays: 0, actualTicketCost: 0,
    homeOfficeDays: 0, arbeitszimmer: 0,
    equipment: { computer: 0, phone: 0, furniture: 0, software: 0, otherTools: 0, books: 0 },
    monthlyInternet: 0, businessTravel: 0, training: 0, jobApplications: 0,
    unionDues: 0, professionalMemberships: 0,
    doubleHousehold: 0, weeklyTripsHome: 0,
  },
  sonderausgaben: {
    statutoryPensionAN: 0, riester: 0, ruerup: 0,
    healthInsurance: 0, longTermCareInsurance: 0, privateHealthInsurance: 0,
    otherInsurance: 0, childcareCosts: 0, schoolFees: 0,
    donations: 0, churchTaxPaid: 0, maintenancePaid: 0, firstVocationalTraining: 0,
  },
  extraordinary: {
    medicalCosts: 0, funeralCosts: 0, disasterCosts: 0,
    careCosts: 0, other: 0, pflegepauschbetrag: 0,
  },
  losses: { carryForward: 0, carryBack: 0 },
  withholding: { lohnsteuer: 0, solzWithheld: 0, churchTaxWithheld: 0, kestWithheld: 0 },
  ...overrides,
});

describe('end-to-end calculator', () => {
  it('returns zero for all outputs when all inputs are 0', () => {
    const r = calculate(baseInputs());
    expect(r.gesamtbetrag).toBe(0);
    expect(r.zve).toBe(0);
    expect(r.estAfterCredits).toBe(0);
    expect(r.totalTax).toBe(0);
  });

  it('computes a reasonable result for a €60k single employee', () => {
    const r = calculate(
      baseInputs({
        employment: {
          primary: fillMonthly(5000),
          secondary: emptyMonthly(), severance: emptyMonthly(), bonus: emptyMonthly(),
          employerReimbursements: 0,
        },
      }),
    );
    // Employment gross = 60,000
    expect(r.employmentGross).toBe(60000);
    // Arbeitnehmer-Pauschbetrag (€1,230) applied since no itemised entered
    expect(r.werbungskostenEffective).toBe(1230);
    expect(r.werbungskostenUsedPauschbetrag).toBe(true);
    // Social security: reasonable range for €60k gross
    expect(r.sozialversicherung.total.toNumber()).toBeGreaterThan(11000);
    expect(r.sozialversicherung.total.toNumber()).toBeLessThan(14000);
    // zvE below gross by Pauschbetrag + Grundfreibetrag at minimum
    expect(r.zve).toBeLessThan(r.employmentGross);
    expect(r.estAfterCredits).toBeGreaterThan(0);
    // Without church tax and below the Soli threshold (€19,950 ESt), totalTax == ESt
    expect(r.totalTax).toBeGreaterThanOrEqual(r.estAfterCredits);
  });

  it('applies Splittingverfahren and reduces tax vs. single for the same joint zvE', () => {
    const employment = {
      primary: fillMonthly(10000),
      secondary: emptyMonthly(), severance: emptyMonthly(), bonus: emptyMonthly(),
      employerReimbursements: 0,
    };
    const single = calculate(baseInputs({ employment }));
    const joint = calculate(
      baseInputs({
        employment,
        personal: {
          ...baseInputs().personal,
          married: true,
          jointAssessment: true,
        },
      }),
    );
    expect(joint.estAfterCredits).toBeLessThan(single.estAfterCredits);
  });

  it('Kinder-Günstigerprüfung: picks Kindergeld for low earners, Kinderfreibetrag for high', () => {
    const lo = calculate(
      baseInputs({
        employment: {
          primary: fillMonthly(3000), secondary: emptyMonthly(),
          severance: emptyMonthly(), bonus: emptyMonthly(), employerReimbursements: 0,
        },
        personal: { ...baseInputs().personal, childrenUnder25: 2 },
      }),
    );
    const hi = calculate(
      baseInputs({
        employment: {
          primary: fillMonthly(10000), secondary: emptyMonthly(),
          severance: emptyMonthly(), bonus: emptyMonthly(), employerReimbursements: 0,
        },
        personal: { ...baseInputs().personal, childrenUnder25: 2 },
      }),
    );
    expect(lo.applyKinderfreibetrag).toBe(false); // Kindergeld wins
    expect(hi.applyKinderfreibetrag).toBe(true);  // Kinderfreibetrag wins
  });

  it('computes Kirchensteuer at 9 % for non-BY/BW, 8 % for Bayern', () => {
    const common = baseInputs({
      personal: { ...baseInputs().personal, churchTax: true },
      employment: {
        primary: fillMonthly(5000), secondary: emptyMonthly(),
        severance: emptyMonthly(), bonus: emptyMonthly(), employerReimbursements: 0,
      },
    });
    const other = calculate({ ...common, personal: { ...common.personal, bundesland: 'OTHER' } });
    const bayern = calculate({ ...common, personal: { ...common.personal, bundesland: 'BY' } });
    expect(bayern.kirchensteuer).toBeLessThan(other.kirchensteuer);
    expect(bayern.kirchensteuer / other.kirchensteuer).toBeCloseTo(8 / 9, 2);
  });
});
