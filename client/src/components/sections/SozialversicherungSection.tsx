import { Section } from '../Section';
import { Cell } from '../Cell';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function SozialversicherungSection() {
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);
  const sv = r.sozialversicherung;

  return (
    <Section number="5" title="Social security (auto)" subtitle="Sozialversicherung — Arbeitnehmeranteil">
      <Cell kind="calc" label="Pension insurance (RV)" value={sv.rentenversicherung.toNumber()} />
      <Cell kind="calc" label="Health insurance (KV)" value={sv.krankenversicherung.toNumber()} />
      <Cell kind="calc" label="Long-term care (PV)" value={sv.pflegeversicherung.toNumber()} />
      <Cell kind="calc" label="Unemployment (ALV)" value={sv.arbeitslosenversicherung.toNumber()} />
      <Cell kind="total" label="Total employee share" value={sv.total.toNumber()} />
    </Section>
  );
}
