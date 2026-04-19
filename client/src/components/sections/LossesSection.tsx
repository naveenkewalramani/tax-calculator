import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function LossesSection() {
  const { value, patch } = useSection('losses');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="6" title="Loss offsets (§10d EStG)" subtitle="Verlustvortrag / -rücktrag">
      <Cell
        label="Loss carry-forward from prior years"
        labelDE="Verlustvortrag"
        value={value.carryForward}
        onChange={(v) => patch({ carryForward: v })}
      />
      <Cell
        label="Loss carry-back to prior year"
        labelDE="Verlustrücktrag"
        help="Capped at €10M; applied up to current Gesamtbetrag"
        value={value.carryBack}
        onChange={(v) => patch({ carryBack: v })}
      />
      <Cell kind="calc" label="Total loss offset applied" value={r.lossOffsetApplied} />
    </Section>
  );
}
