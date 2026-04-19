import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function OtherIncomeSection() {
  const { value, patch } = useSection('other');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="1F" title="Other income (§22 EStG)" subtitle="Sonstige Einkünfte">
      <Cell
        label="Statutory pension (taxable portion)"
        labelDE="Gesetzliche Rente"
        value={value.statutoryPension}
        onChange={(v) => patch({ statutoryPension: v })}
      />
      <Cell
        label="Private annuity (Ertragsanteil)"
        labelDE="Leibrente"
        value={value.privateAnnuity}
        onChange={(v) => patch({ privateAnnuity: v })}
      />
      <Cell
        label="Maintenance received (Realsplitting)"
        labelDE="Unterhalt (Empfang)"
        value={value.maintenanceReceived}
        onChange={(v) => patch({ maintenanceReceived: v })}
      />
      <Cell
        label="Speculation gains (<1 yr) §23"
        labelDE="Spekulationsgewinne"
        value={value.speculationGains}
        onChange={(v) => patch({ speculationGains: v })}
      />
      <Cell
        label="Crypto gains (<1 yr)"
        labelDE="Kryptowährungsgewinne"
        value={value.cryptoGains}
        onChange={(v) => patch({ cryptoGains: v })}
      />
      <Cell
        label="Other miscellaneous income"
        labelDE="Sonstige Einkünfte"
        value={value.miscOther}
        onChange={(v) => patch({ miscOther: v })}
      />
      <Cell kind="total" label="Total other income" value={r.otherIncome} />
    </Section>
  );
}
