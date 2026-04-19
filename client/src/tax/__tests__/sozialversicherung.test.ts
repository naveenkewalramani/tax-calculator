import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { ratesFor } from '../rates';
import { calcSozialversicherung, pflegerateEmployee } from '../sozialversicherung';
import type { PersonalInfo } from '../types';

const r = ratesFor(2025);
const basePersonal = (overrides: Partial<PersonalInfo> = {}): PersonalInfo => ({
  steuerklasse: 1,
  churchTax: false,
  childrenUnder25: 0,
  disabilityGdB: 0,
  blindOrSevereCare: false,
  monthsInGermany: 12,
  married: false,
  jointAssessment: false,
  bundesland: 'OTHER',
  ...overrides,
});

describe('Pflegeversicherung employee rate (§55 SGB XI)', () => {
  it('is 2.4 % for childless', () => {
    expect(pflegerateEmployee(0, r).toNumber()).toBeCloseTo(0.024, 4);
  });
  it('is 1.8 % with 1 child', () => {
    expect(pflegerateEmployee(1, r).toNumber()).toBeCloseTo(0.018, 4);
  });
  it('reduces by 0.25 %/child from 2nd to 5th', () => {
    expect(pflegerateEmployee(2, r).toNumber()).toBeCloseTo(0.0155, 4);
    expect(pflegerateEmployee(5, r).toNumber()).toBeCloseTo(0.008, 4);
  });
  it('floors at 0.5 %', () => {
    expect(pflegerateEmployee(10, r).toNumber()).toBeCloseTo(0.008, 4);
  });
});

describe('calcSozialversicherung', () => {
  it('caps KV/PV at bbgHealthCare and RV/ALV at bbgPensionUnemployment', () => {
    const sv = calcSozialversicherung(new Decimal(120000), basePersonal(), r);
    // KV uses bbgHealthCare = 66150
    expect(sv.krankenversicherung.toNumber()).toBeCloseTo(66150 * r.tkHealthTotal, 1);
    // RV uses bbgPensionUnemployment = 96600
    expect(sv.rentenversicherung.toNumber()).toBeCloseTo(96600 * r.rentenversicherungEmployee, 1);
  });

  it('scales proportionally below BBG', () => {
    const sv = calcSozialversicherung(new Decimal(40000), basePersonal(), r);
    expect(sv.krankenversicherung.toNumber()).toBeCloseTo(40000 * r.tkHealthTotal, 1);
    expect(sv.rentenversicherung.toNumber()).toBeCloseTo(40000 * r.rentenversicherungEmployee, 1);
  });

  it('reduces PV with children', () => {
    const svChildless = calcSozialversicherung(new Decimal(40000), basePersonal(), r);
    const svOneChild = calcSozialversicherung(
      new Decimal(40000), basePersonal({ childrenUnder25: 1 }), r,
    );
    expect(svOneChild.pflegeversicherung.lt(svChildless.pflegeversicherung)).toBe(true);
  });
});
