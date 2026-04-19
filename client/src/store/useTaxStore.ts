import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaxInputs, TaxYear } from '../tax/types';
import { emptyMonthly } from '../tax/types';

type State = {
  year: TaxYear;
  inputs: Record<TaxYear, TaxInputs>;
  setYear: (y: TaxYear) => void;
  update: <K extends keyof TaxInputs>(year: TaxYear, key: K, value: TaxInputs[K]) => void;
  resetYear: (y: TaxYear) => void;
};

const blankInputs = (year: TaxYear): TaxInputs => ({
  year,
  personal: {
    steuerklasse: 1,
    churchTax: false,
    childrenUnder25: 0,
    disabilityGdB: 0,
    blindOrSevereCare: false,
    monthsInGermany: 12,
    married: false,
    jointAssessment: false,
    bundesland: 'OTHER',
  },
  employment: {
    primary: emptyMonthly(),
    secondary: emptyMonthly(),
    severance: emptyMonthly(),
    bonus: emptyMonthly(),
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
});

export const useTaxStore = create<State>()(
  persist(
    (set) => ({
      year: 2025,
      inputs: { 2025: blankInputs(2025), 2026: blankInputs(2026) },
      setYear: (y) => set({ year: y }),
      update: (y, key, value) =>
        set((s) => ({ inputs: { ...s.inputs, [y]: { ...s.inputs[y], [key]: value } } })),
      resetYear: (y) => set((s) => ({ inputs: { ...s.inputs, [y]: blankInputs(y) } })),
    }),
    { name: 'taxsim-inputs-v1' },
  ),
);
