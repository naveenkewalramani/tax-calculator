import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function FreelanceTradeSection() {
  const freelance = useSection('freelance');
  const trade = useSection('trade');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <>
      <Section number="1B" title="Self-employment (§18 EStG)" subtitle="Freiberufliche Tätigkeit">
        <Cell
          label="Freelance / consulting revenue"
          labelDE="Einnahmen (brutto)"
          value={freelance.value.revenue}
          onChange={(v) => freelance.patch({ revenue: v })}
        />
        <Cell
          label="Business expenses"
          labelDE="Betriebsausgaben"
          value={freelance.value.expenses}
          onChange={(v) => freelance.patch({ expenses: v })}
        />
        <Cell kind="calc" label="Net freelance income" labelDE="Gewinn" value={r.freelanceNet} />
      </Section>

      <Section number="1C" title="Trade / business (§15 EStG)" subtitle="Gewerbebetrieb">
        <Cell
          label="Business profit"
          labelDE="Gewinn aus Gewerbebetrieb"
          value={trade.value.profit}
          onChange={(v) => trade.patch({ profit: v })}
        />
        <Cell
          label="Trade tax credit (§35)"
          labelDE="Gewerbesteuer-Anrechnung"
          help="Credited against income tax — reduces final ESt, not zvE"
          value={trade.value.tradeTaxCredit}
          onChange={(v) => trade.patch({ tradeTaxCredit: v })}
        />
      </Section>
    </>
  );
}
