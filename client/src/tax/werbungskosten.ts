import Decimal from 'decimal.js';
import type { WerbungskostenInput } from './types';
import type { YearRates } from './rates';

const D = (n: Decimal.Value) => new Decimal(n);

export function commutingAllowance(
  km: number, days: number, r: YearRates,
): Decimal {
  const changeover = r.commuterChangeoverKm; // 20 in 2025, 0 in 2026
  if (km <= changeover) {
    return D(days).mul(km).mul(r.commuterRateFirst20km);
  }
  const firstPart = D(days).mul(changeover).mul(r.commuterRateFirst20km);
  const rest = D(days).mul(km - changeover).mul(r.commuterRateFromKm21);
  return firstPart.plus(rest);
}

export function homeOfficePauschale(days: number, r: YearRates): Decimal {
  return D(Math.min(days, r.homeOfficeMaxDays)).mul(r.homeOfficeDayRate);
}

export function internetDeduction(monthly: number, r: YearRates): Decimal {
  const monthlyPct = D(monthly).mul(r.internetDeductiblePct);
  const capped = Decimal.min(monthlyPct, r.internetMonthlyMax);
  return capped.mul(12).toDecimalPlaces(2);
}

export function itemisedWerbungskosten(w: WerbungskostenInput, r: YearRates): Decimal {
  const commuting = Decimal.max(
    commutingAllowance(w.commutingKm, w.commutingDays, r),
    w.actualTicketCost,
  );
  const ho = Decimal.max(homeOfficePauschale(w.homeOfficeDays, r), w.arbeitszimmer);
  const eq = D(w.equipment.computer)
    .plus(w.equipment.phone)
    .plus(w.equipment.furniture)
    .plus(w.equipment.software)
    .plus(w.equipment.otherTools)
    .plus(w.equipment.books);
  const internet = internetDeduction(w.monthlyInternet, r);
  return commuting
    .plus(ho)
    .plus(eq)
    .plus(internet)
    .plus(w.businessTravel)
    .plus(w.training)
    .plus(w.jobApplications)
    .plus(w.unionDues)
    .plus(w.professionalMemberships)
    .plus(w.doubleHousehold)
    .plus(w.weeklyTripsHome)
    .toDecimalPlaces(2);
}

export function effectiveWerbungskosten(
  w: WerbungskostenInput, r: YearRates,
): { itemised: Decimal; effective: Decimal; usedPauschbetrag: boolean } {
  const itemised = itemisedWerbungskosten(w, r);
  const effective = Decimal.max(itemised, r.arbeitnehmerPauschbetrag);
  return {
    itemised,
    effective,
    usedPauschbetrag: effective.greaterThan(itemised) || effective.equals(r.arbeitnehmerPauschbetrag),
  };
}
