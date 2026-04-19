import { Section } from '../Section';
import { Cell } from '../Cell';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function ZvESection() {
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="7" title="Taxable income (zvE)" subtitle="Zu versteuerndes Einkommen">
      <Cell kind="calc" label="Gesamtbetrag der Einkünfte" value={r.gesamtbetrag} />
      <Cell kind="calc" label="− Werbungskosten" value={r.werbungskostenEffective} />
      <Cell kind="calc" label="− Sonderausgaben" value={r.sonderausgaben} />
      <Cell kind="calc" label="− Außergewöhnliche Belastungen" value={r.extraordinary} />
      <Cell kind="calc" label="− Verlustabzug" value={r.lossOffsetApplied} />
      <Cell kind="calc" label="− Grundfreibetrag (pro-rata)" value={r.grundfreibetragProrata} />
      <Cell kind="total" label="Zu versteuerndes Einkommen (zvE)" value={r.zve} />
    </Section>
  );
}
