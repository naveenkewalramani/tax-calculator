export type TaxYear = 2025 | 2026;

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;
export type Month = typeof MONTHS[number];

export type Monthly = Record<Month, number>;

export const emptyMonthly = (): Monthly => ({
  Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
  Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
});

export type PersonalInfo = {
  steuerklasse: 1 | 2 | 3 | 4 | 5;
  churchTax: boolean;
  childrenUnder25: number;
  disabilityGdB: 0 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
  blindOrSevereCare: boolean;
  monthsInGermany: number;
  married: boolean;
  jointAssessment: boolean;
  bundesland: 'BY' | 'BW' | 'OTHER';
};

export type EmploymentInput = {
  primary: Monthly;
  secondary: Monthly;
  severance: Monthly;
  bonus: Monthly;
  employerReimbursements: number;
};

export type FreelanceInput = { revenue: number; expenses: number };
export type TradeInput = { profit: number; tradeTaxCredit: number };

export type RentalInput = {
  grossRent: number;
  mortgageInterest: number;
  depreciation: number;
  maintenance: number;
  mgmtInsuranceTax: number;
  otherExpenses: number;
};

export type CapitalInput = {
  dividendsDE: number;
  dividendsForeign: number;
  interest: number;
  etfDistributions: number;
  realisedGains: number;
  lossesOffset: number;
  foreignWithholding: number;
  electGuenstigerpruefung: boolean;
};

export type OtherIncomeInput = {
  statutoryPension: number;
  privateAnnuity: number;
  maintenanceReceived: number;
  speculationGains: number;
  cryptoGains: number;
  miscOther: number;
};

export type WerbungskostenInput = {
  commutingKm: number;
  commutingDays: number;
  actualTicketCost: number;
  homeOfficeDays: number;
  arbeitszimmer: number;
  equipment: { computer: number; phone: number; furniture: number; software: number; otherTools: number; books: number };
  monthlyInternet: number;
  businessTravel: number;
  training: number;
  jobApplications: number;
  unionDues: number;
  professionalMemberships: number;
  doubleHousehold: number;
  weeklyTripsHome: number;
};

export type SonderausgabenInput = {
  statutoryPensionAN: number;
  riester: number;
  ruerup: number;
  healthInsurance: number;
  longTermCareInsurance: number;
  privateHealthInsurance: number;
  otherInsurance: number;
  childcareCosts: number;
  schoolFees: number;
  donations: number;
  churchTaxPaid: number;
  maintenancePaid: number;
  firstVocationalTraining: number;
};

export type ExtraordinaryInput = {
  medicalCosts: number;
  funeralCosts: number;
  disasterCosts: number;
  careCosts: number;
  other: number;
  pflegepauschbetrag: number;
};

export type LossOffsetInput = { carryForward: number; carryBack: number };

export type WithholdingInput = {
  lohnsteuer: number;
  solzWithheld: number;
  churchTaxWithheld: number;
  kestWithheld: number;
};

export type TaxInputs = {
  year: TaxYear;
  personal: PersonalInfo;
  employment: EmploymentInput;
  freelance: FreelanceInput;
  trade: TradeInput;
  rental: RentalInput;
  capital: CapitalInput;
  other: OtherIncomeInput;
  werbungskosten: WerbungskostenInput;
  sonderausgaben: SonderausgabenInput;
  extraordinary: ExtraordinaryInput;
  losses: LossOffsetInput;
  withholding: WithholdingInput;
};
