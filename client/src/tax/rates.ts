// Tax rates & constants sourced from German_Tax_Complete_2025_2026.xlsx "Rates" sheet.
// All values per year are locked — users cannot edit them in the UI.
// Sources cited inline are the official §§ and BMF guidance referenced by the xlsx.

import type { TaxYear } from './types';

export type YearRates = {
  // §32a income tax
  grundfreibetrag: number;
  zone2Upper: number;
  zone3Upper: number;
  reichensteuerThreshold: number;
  topRate: number; // 0.42
  reichensteuerRate: number; // 0.45
  // §32a tariff coefficients (5-zone piecewise, per BMF)
  tariff: {
    // zone 2: (a * y + b) * y with y = (zvE - grundfreibetrag) / 10000
    z2_a: number;
    z2_b: number;
    // zone 3: (a * z + b) * z + c with z = (zvE - zone2Upper) / 10000
    z3_a: number;
    z3_b: number;
    z3_c: number;
    // zone 4: topRate*zvE - z4_const
    z4_const: number;
    // zone 5: reichensteuerRate*zvE - z5_const
    z5_const: number;
  };
  // Solidaritätszuschlag
  solzRate: number;
  solzExemptionEstLimit: number;
  solzMilderungsZoneUpper: number;
  // Kirchensteuer
  churchTaxRateDefault: number; // 9%
  churchTaxRateBwBy: number; // 8%
  // Social security — employee contribution rates
  rentenversicherungEmployee: number;
  healthBase: number; // 7.3%
  tkZusatzbeitragEmployee: number;
  tkHealthTotal: number;
  pflegeBase: number;
  pflegeChildlessSurcharge: number;
  pflegeChildReductionPerChild: number; // from 2nd child
  alvEmployee: number;
  // BBG — Beitragsbemessungsgrenzen (annual)
  bbgHealthCare: number;
  bbgPensionUnemployment: number;
  jaegHealth: number;
  // Pauschbeträge
  arbeitnehmerPauschbetrag: number;
  sparerPauschbetrag: number;
  homeOfficeDayRate: number;
  homeOfficeMaxDays: number;
  giwgSofortAbschreibungNetto: number;
  commuterRateFirst20km: number;
  commuterRateFromKm21: number;
  commuterChangeoverKm: number;
  internetMonthlyMax: number;
  internetDeductiblePct: number;
  pensionMaxDeduction: number;
  zumutbareBelastungFlat: number;
  behindertenPauschbetrag: Record<number, number>;
  blindenPauschbetrag: number;
  kinderfreibetragTotal: number;
  bedarfsfreibetragBEA: number;
  kindergeldMonthly: number;
  entlastungsbetragAlleinerziehende: number;
  entlastungsbetragZusatzKind: number;
  // Capital income
  abgeltungsteuerRate: number;
  abgeltungsteuerSolz: number;
  abgeltungsteuerEffective: number;
  // Rental / AfA
  afaResidentialOld: number;
  afaResidentialNew: number;
};

const rates2025: YearRates = {
  grundfreibetrag: 12096,
  zone2Upper: 17443,
  zone3Upper: 68480,
  reichensteuerThreshold: 277825,
  topRate: 0.42,
  reichensteuerRate: 0.45,
  tariff: {
    // §32a EStG 2025 — official BMF coefficients (Jahressteuergesetz 2024).
    // These replace the xlsx values (972.87 / 212.02 / …) which produce visible
    // discontinuities at the zone 2/3 and 3/4 boundaries. See BUGS_FIXED.md.
    z2_a: 932.30, z2_b: 1400,
    z3_a: 176.64, z3_b: 2397, z3_c: 1015.13,
    z4_const: 10911.92,
    z5_const: 19246.67,
  },
  solzRate: 0.055,
  solzExemptionEstLimit: 19950,
  solzMilderungsZoneUpper: 33912,
  churchTaxRateDefault: 0.09,
  churchTaxRateBwBy: 0.08,
  rentenversicherungEmployee: 0.093,
  healthBase: 0.073,
  tkZusatzbeitragEmployee: 0.01225,
  tkHealthTotal: 0.08525,
  pflegeBase: 0.018,
  pflegeChildlessSurcharge: 0.006,
  pflegeChildReductionPerChild: 0.0025,
  alvEmployee: 0.013,
  bbgHealthCare: 66150,
  bbgPensionUnemployment: 96600,
  jaegHealth: 73800,
  arbeitnehmerPauschbetrag: 1230,
  sparerPauschbetrag: 1000,
  homeOfficeDayRate: 6,
  homeOfficeMaxDays: 210,
  giwgSofortAbschreibungNetto: 800,
  commuterRateFirst20km: 0.30,
  commuterRateFromKm21: 0.38,
  commuterChangeoverKm: 20,
  internetMonthlyMax: 20,
  internetDeductiblePct: 0.20,
  pensionMaxDeduction: 29344,
  zumutbareBelastungFlat: 0.03,
  behindertenPauschbetrag: {
    0: 0, 20: 384, 30: 620, 40: 860, 50: 1140,
    60: 1440, 70: 1780, 80: 2120, 90: 2460, 100: 2840,
  },
  blindenPauschbetrag: 7400,
  kinderfreibetragTotal: 6384,
  bedarfsfreibetragBEA: 2928,
  kindergeldMonthly: 255,
  entlastungsbetragAlleinerziehende: 4260,
  entlastungsbetragZusatzKind: 240,
  abgeltungsteuerRate: 0.25,
  abgeltungsteuerSolz: 0.055,
  abgeltungsteuerEffective: 0.26375,
  afaResidentialOld: 0.02,
  afaResidentialNew: 0.03,
};

const rates2026: YearRates = {
  ...rates2025,
  grundfreibetrag: 12348,
  zone2Upper: 17799,
  zone3Upper: 69878,
  // §32a EStG 2026 — derived from continuity at the published zone boundaries
  // with marginal rates pinned at 14 %, 23.97 %, and 42 % (standard BMF shape).
  tariff: {
    z2_a: 914.51, z2_b: 1400,
    z3_a: 173.09, z3_b: 2397, z3_c: 1034.87,
    z4_const: 11135.97,
    z5_const: 19470.72,
  },
  tkZusatzbeitragEmployee: 0.01345,
  tkHealthTotal: 0.08645,
  bbgHealthCare: 69750,
  bbgPensionUnemployment: 101400,
  jaegHealth: 77400,
  // 2026: flat 38¢/km from km 1 (Koalitionsvertrag proposal)
  commuterRateFirst20km: 0.38,
  commuterChangeoverKm: 0,
  kindergeldMonthly: 259,
};

export const RATES: Record<TaxYear, YearRates> = {
  2025: rates2025,
  2026: rates2026,
};

export function ratesFor(year: TaxYear): YearRates {
  return RATES[year];
}
