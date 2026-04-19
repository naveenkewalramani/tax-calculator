import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function ExtraordinarySection() {
  const { value, patch } = useSection('extraordinary');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="4" title="Extraordinary burdens (§33 EStG)" subtitle="Außergewöhnliche Belastungen">
      <Cell label="Medical costs not covered" value={value.medicalCosts} onChange={(v) => patch({ medicalCosts: v })} />
      <Cell label="Funeral costs" value={value.funeralCosts} onChange={(v) => patch({ funeralCosts: v })} />
      <Cell label="Natural disaster (uninsured)" value={value.disasterCosts} onChange={(v) => patch({ disasterCosts: v })} />
      <Cell label="Care costs for dependants" value={value.careCosts} onChange={(v) => patch({ careCosts: v })} />
      <Cell label="Other extraordinary burdens" value={value.other} onChange={(v) => patch({ other: v })} />
      <Cell
        label="Pflegepauschbetrag (caring at home)"
        labelDE="Pflege-Pauschbetrag"
        help="€600 / €1,100 / €1,800 based on Pflegegrad — enter directly"
        value={value.pflegepauschbetrag}
        onChange={(v) => patch({ pflegepauschbetrag: v })}
      />
      <Cell
        kind="total"
        label="Total extraordinary burden deduction"
        labelDE="Summe abzugsfähig"
        value={r.extraordinary}
        note="§33 burdens reduced by the 3-tier zumutbare Belastung; §33a/b flat rates added directly"
      />
    </Section>
  );
}
