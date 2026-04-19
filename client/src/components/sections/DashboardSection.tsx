import { Section } from '../Section';
import { Cell } from '../Cell';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';
import { ratesFor } from '../../tax/rates';

export function DashboardSection() {
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);
  const rates = ratesFor(year);
  const effGross = r.gesamtbetrag > 0 ? r.totalTax / r.gesamtbetrag : 0;
  const effEmp = r.employmentGross > 0 ? r.totalTax / r.employmentGross : 0;
  const burdenEmp = r.employmentGross > 0
    ? (r.totalTax + r.sozialversicherung.total.toNumber()) / r.employmentGross
    : 0;

  const zone =
    r.zve === 0 ? '0 % — below Grundfreibetrag'
      : r.zve <= rates.zone3Upper ? '14–42 % progressive zone'
        : r.zve <= rates.reichensteuerThreshold ? '42 % flat zone'
          : '45 % Reichensteuer';

  return (
    <Section number="11" title="Effective rates dashboard" subtitle="Effektive Steuerbelastung">
      <Cell kind="calc" label="Total gross employment" value={r.employmentGross} />
      <Cell kind="calc" label="Total all-source income" value={r.gesamtbetrag} />
      <Cell kind="calc" label="Taxable income (zvE)" value={r.zve} />
      <Cell kind="calc" label="Income tax owed" value={r.estAfterCredits} />
      <Cell kind="calc" label="Effective rate on gross employment" value={effEmp} unit="%" />
      <Cell kind="calc" label="Effective rate on all income" value={effGross} unit="%" />
      <Cell kind="calc" label="Total social security (employee)" value={r.sozialversicherung.total.toNumber()} />
      <Cell kind="calc" label="Total burden rate on employment" value={burdenEmp} unit="%" />
      <Cell kind="calc" label="Estimated net take-home" value={r.netTakeHome} />
      <div className="text-xs text-slate-500 pt-2">
        <strong>Tax zone:</strong> {zone}
        <br />
        <strong>Solidaritätszuschlag:</strong> {r.solz > 0 ? 'YES — Soli due' : 'NO — exempt'}
      </div>
    </Section>
  );
}
