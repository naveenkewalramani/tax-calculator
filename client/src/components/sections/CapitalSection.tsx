import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function CapitalSection() {
  const { value, patch } = useSection('capital');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="1E" title="Capital investment income (§20 EStG)" subtitle="Kapitalerträge">
      <Cell
        label="Dividends — German companies (gross)"
        labelDE="Dividenden (deutsch)"
        value={value.dividendsDE}
        onChange={(v) => patch({ dividendsDE: v })}
      />
      <Cell
        label="Dividends — foreign companies (gross)"
        labelDE="Dividenden (ausländisch)"
        value={value.dividendsForeign}
        onChange={(v) => patch({ dividendsForeign: v })}
      />
      <Cell
        label="Interest income"
        labelDE="Zinseinkünfte"
        help="Tagesgeld, Festgeld, bonds"
        value={value.interest}
        onChange={(v) => patch({ interest: v })}
      />
      <Cell
        label="ETF / fund distributions"
        labelDE="Ausschüttungen"
        value={value.etfDistributions}
        onChange={(v) => patch({ etfDistributions: v })}
      />
      <Cell
        label="Realised capital gains"
        labelDE="Veräußerungsgewinne"
        value={value.realisedGains}
        onChange={(v) => patch({ realisedGains: v })}
      />
      <Cell
        label="Capital losses to offset"
        labelDE="Verlustverrechnungstopf"
        value={value.lossesOffset}
        onChange={(v) => patch({ lossesOffset: v })}
      />
      <Cell
        label="Foreign withholding tax paid"
        labelDE="Ausländische Quellensteuer"
        value={value.foreignWithholding}
        onChange={(v) => patch({ foreignWithholding: v })}
      />
      <Cell
        label="Elect Günstigerprüfung?"
        labelDE="Günstigerprüfung §32d Abs.6"
        help="Set to 1 if your progressive rate is below 25 %. Capital income is then folded into zvE and the separate 25 % Abgeltungsteuer is skipped."
        value={value.electGuenstigerpruefung ? 1 : 0}
        onChange={(v) => patch({ electGuenstigerpruefung: v > 0 })}
        integer
      />
      <Cell kind="calc" label="Capital gains tax (Abgeltungsteuer)" value={r.capitalTax} />
    </Section>
  );
}
