import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function WithholdingSection() {
  const { value, patch } = useSection('withholding');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);
  const isRefund = r.refundOrPayment >= 0;

  return (
    <Section number="10" title="Lohnsteuer reconciliation" subtitle="From your Lohnsteuerbescheinigung">
      <Cell
        label="Lohnsteuer withheld (Zeile 4)"
        labelDE="Einbehaltene Lohnsteuer"
        value={value.lohnsteuer}
        onChange={(v) => patch({ lohnsteuer: v })}
      />
      <Cell
        label="Solidaritätszuschlag withheld (Zeile 5)"
        value={value.solzWithheld}
        onChange={(v) => patch({ solzWithheld: v })}
      />
      <Cell
        label="Kirchensteuer withheld (Zeile 6)"
        value={value.churchTaxWithheld}
        onChange={(v) => patch({ churchTaxWithheld: v })}
      />
      <Cell
        label="KESt withheld by banks"
        labelDE="Kapitalertragsteuer"
        value={value.kestWithheld}
        onChange={(v) => patch({ kestWithheld: v })}
      />
      <Cell kind="calc" label="Total already paid" value={r.alreadyWithheld} />
      <Cell
        kind="total"
        label={isRefund ? 'Refund (Erstattung)' : 'Additional payment (Nachzahlung)'}
        value={Math.abs(r.refundOrPayment)}
        note={
          isRefund
            ? 'You overpaid — Finanzamt owes you this amount'
            : 'You underpaid — this amount is owed to the Finanzamt'
        }
      />
    </Section>
  );
}
