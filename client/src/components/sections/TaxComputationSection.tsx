import { Section } from '../Section';
import { Cell } from '../Cell';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function TaxComputationSection() {
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="8" title="Income tax computation" subtitle="§32a EStG progressive tariff">
      <Cell
        kind="calc"
        label="Einkommensteuer (§32a)"
        labelDE={inputs[year].personal.jointAssessment ? 'Splittingverfahren angewandt' : 'Grundtarif'}
        value={r.estBase}
      />
      {r.applyKinderfreibetrag ? (
        <Cell
          kind="calc"
          label="− Kinderfreibetrag (Günstigerprüfung)"
          value={r.kinderfreibetragTaxSaving}
          note={`Saves more than Kindergeld (€${r.kindergeld.toFixed(2)})`}
        />
      ) : r.kindergeld > 0 ? (
        <Cell
          kind="calc"
          label="Kindergeld (more beneficial)"
          value={r.kindergeld}
          note="Kindergeld received, Kinderfreibetrag NOT applied"
        />
      ) : null}
      {r.tradeTaxCredit > 0 && (
        <Cell kind="calc" label="− Gewerbesteuer-Anrechnung §35" value={r.tradeTaxCredit} />
      )}
      <Cell kind="calc" label="Einkommensteuer nach Anrechnung" value={r.estAfterCredits} />
      <Cell
        kind="calc"
        label="+ Solidaritätszuschlag"
        value={r.solz}
        note="Milderungszone phase-in above ESt €19,950"
      />
      <Cell
        kind="calc"
        label="+ Kirchensteuer"
        value={r.kirchensteuer}
        note="Computed on ESt with Kinderfreibetrag per §51a"
      />
      {r.capitalTax > 0 && (
        <Cell
          kind="calc"
          label="+ Kapitalertragsteuer (Abgeltungsteuer)"
          value={r.capitalTax}
        />
      )}
      <Cell kind="total" label="Gesamte Steuerlast" value={r.totalTax} />
    </Section>
  );
}
