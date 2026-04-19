import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function SonderausgabenSection() {
  const { value, patch } = useSection('sonderausgaben');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  return (
    <Section number="3" title="Sonderausgaben (§10 EStG)" subtitle="Special deductions">
      <h3 className="text-xs font-semibold text-slate-500 uppercase">3A Pension & retirement</h3>
      <Cell
        label="Statutory pension (employee share)"
        labelDE="Rentenversicherung AN"
        help="From your Lohnsteuerbescheinigung"
        value={value.statutoryPensionAN}
        onChange={(v) => patch({ statutoryPensionAN: v })}
      />
      <Cell label="Riester contributions" value={value.riester} onChange={(v) => patch({ riester: v })} />
      <Cell label="Rürup (Basisrente) contributions" value={value.ruerup} onChange={(v) => patch({ ruerup: v })} />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">3B Insurance</h3>
      <Cell label="Health insurance (KV)" labelDE="Krankenversicherung AN" value={value.healthInsurance} onChange={(v) => patch({ healthInsurance: v })} />
      <Cell label="Long-term care (PV)" labelDE="Pflegeversicherung AN" value={value.longTermCareInsurance} onChange={(v) => patch({ longTermCareInsurance: v })} />
      <Cell label="Private health insurance (PKV basic)" value={value.privateHealthInsurance} onChange={(v) => patch({ privateHealthInsurance: v })} />
      <Cell label="Other insurance (life, accident, liability)" value={value.otherInsurance} onChange={(v) => patch({ otherInsurance: v })} />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">3C Education & childcare</h3>
      <Cell
        label="Childcare costs"
        labelDE="Kinderbetreuungskosten"
        help="80 % deductible, capped at €4,800 per child"
        value={value.childcareCosts}
        onChange={(v) => patch({ childcareCosts: v })}
      />
      <Cell
        label="Private school fees"
        labelDE="Schulgeld"
        help="30 % deductible, capped at €5,000"
        value={value.schoolFees}
        onChange={(v) => patch({ schoolFees: v })}
      />
      <Cell
        label="First-time vocational training"
        labelDE="Erstausbildung"
        help="Capped at €6,000"
        value={value.firstVocationalTraining}
        onChange={(v) => patch({ firstVocationalTraining: v })}
      />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">3D Donations & church</h3>
      <Cell
        label="Charitable donations"
        labelDE="Spenden"
        help="Capped at 20 % of Gesamtbetrag der Einkünfte"
        value={value.donations}
        onChange={(v) => patch({ donations: v })}
      />
      <Cell label="Church tax paid in year" labelDE="Gezahlte Kirchensteuer" value={value.churchTaxPaid} onChange={(v) => patch({ churchTaxPaid: v })} />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">3E Maintenance paid</h3>
      <Cell
        label="Maintenance paid (ex-spouse)"
        labelDE="Unterhalt (Realsplitting)"
        help="Capped at €13,805"
        value={value.maintenancePaid}
        onChange={(v) => patch({ maintenancePaid: v })}
      />

      <Cell kind="total" label="Total Sonderausgaben" value={r.sonderausgaben} />
    </Section>
  );
}
