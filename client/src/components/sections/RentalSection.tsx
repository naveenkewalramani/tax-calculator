import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function RentalSection() {
  const { value, patch } = useSection('rental');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="1D" title="Rental & leasing (§21 EStG)" subtitle="Vermietung und Verpachtung">
      <Cell
        label="Total rental income (gross)"
        labelDE="Einnahmen (alle Objekte)"
        value={value.grossRent}
        onChange={(v) => patch({ grossRent: v })}
      />
      <Cell
        label="Mortgage interest"
        labelDE="Schuldzinsen"
        value={value.mortgageInterest}
        onChange={(v) => patch({ mortgageInterest: v })}
      />
      <Cell
        label="Depreciation (AfA)"
        labelDE="Abschreibung"
        help="2 % for pre-2023 residential, 3 % for post-2022 residential (on building value)"
        value={value.depreciation}
        onChange={(v) => patch({ depreciation: v })}
      />
      <Cell
        label="Maintenance & repair"
        labelDE="Erhaltungsaufwand"
        value={value.maintenance}
        onChange={(v) => patch({ maintenance: v })}
      />
      <Cell
        label="Mgmt, insurance, property tax"
        labelDE="Hausverwaltung, Versicherung, Grundsteuer"
        value={value.mgmtInsuranceTax}
        onChange={(v) => patch({ mgmtInsuranceTax: v })}
      />
      <Cell
        label="Other expenses"
        labelDE="Sonstige Werbungskosten"
        value={value.otherExpenses}
        onChange={(v) => patch({ otherExpenses: v })}
      />
      <Cell
        kind="calc"
        label="Net rental income / loss"
        labelDE="Überschuss / Verlust"
        value={r.rentalNet}
        note="Losses can offset other income sources"
      />
    </Section>
  );
}
