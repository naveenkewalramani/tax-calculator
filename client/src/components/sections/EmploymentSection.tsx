import { Section } from '../Section';
import { Cell } from '../Cell';
import { MonthlyGrid } from '../MonthlyGrid';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function EmploymentSection() {
  const { value, patch } = useSection('employment');
  const { year, inputs } = useTaxStore();
  const result = calculate(inputs[year]);

  return (
    <Section number="1A" title="Employment income (§19 EStG)" subtitle="Nichtselbstständige Arbeit">
      <MonthlyGrid
        label="Primary employer"
        labelDE="Hauptarbeitgeber (brutto)"
        value={value.primary}
        onChange={(m) => patch({ primary: m })}
        help="Enter the gross monthly salary for each month (or 0 for months not worked). Use the value from your Lohnsteuerbescheinigung 'Bruttoarbeitslohn'."
      />
      <MonthlyGrid
        label="Secondary employer / mini-job"
        labelDE="Zweitarbeitgeber / Minijob"
        value={value.secondary}
        onChange={(m) => patch({ secondary: m })}
      />
      <MonthlyGrid
        label="Severance payment"
        labelDE="Abfindung"
        value={value.severance}
        onChange={(m) => patch({ severance: m })}
        help="Fünftelregelung (§34 EStG) not yet modelled — severance is treated as regular income"
      />
      <MonthlyGrid
        label="Bonus / 13th month"
        labelDE="Einmalzahlungen"
        value={value.bonus}
        onChange={(m) => patch({ bonus: m })}
      />
      <Cell
        label="Employer reimbursements (tax-free)"
        labelDE="Steuerfreie Arbeitgebererstattungen"
        help="Kept separate — not added to taxable employment income"
        value={value.employerReimbursements}
        onChange={(v) => patch({ employerReimbursements: v })}
      />
      <Cell
        kind="total"
        label="Total gross employment income"
        labelDE="Summe Bruttoarbeitslohn"
        value={result.employmentGross}
      />
    </Section>
  );
}
