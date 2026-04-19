import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import { useTaxStore } from '../../store/useTaxStore';
import { calculate } from '../../tax/calculator';

export function WerbungskostenSection() {
  const { value, patch } = useSection('werbungskosten');
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);

  const setEq = (k: keyof typeof value.equipment, v: number) =>
    patch({ equipment: { ...value.equipment, [k]: v } });

  return (
    <Section number="2" title="Werbungskosten (§9 EStG)" subtitle="Work-related expenses">
      <h3 className="text-xs font-semibold text-slate-500 uppercase">2A Commuting</h3>
      <Cell
        label="One-way distance (km)"
        labelDE="Einfache Entfernung"
        value={value.commutingKm}
        onChange={(v) => patch({ commutingKm: v })}
        unit="km"
      />
      <Cell
        label="Actual commuting days"
        labelDE="Fahrten pro Jahr"
        value={value.commutingDays}
        onChange={(v) => patch({ commutingDays: v })}
        integer
      />
      <Cell
        label="Actual ticket cost (Deutschlandticket)"
        labelDE="Ticketkosten"
        help="Higher of km-based allowance vs. actual ticket is deducted"
        value={value.actualTicketCost}
        onChange={(v) => patch({ actualTicketCost: v })}
      />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">2B Home office</h3>
      <Cell
        label="WFH days (Homeoffice-Pauschale)"
        labelDE="Homeoffice-Tage (max 210)"
        help="€6/day, max 210 days/year = €1,260. Can't combine with Arbeitszimmer."
        value={value.homeOfficeDays}
        onChange={(v) => patch({ homeOfficeDays: v })}
        integer
      />
      <Cell
        label="Dedicated Arbeitszimmer costs"
        labelDE="Häusliches Arbeitszimmer"
        value={value.arbeitszimmer}
        onChange={(v) => patch({ arbeitszimmer: v })}
      />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">2C Work equipment</h3>
      <Cell label="Computer / laptop" value={value.equipment.computer} onChange={(v) => setEq('computer', v)} />
      <Cell label="Smartphone (work share)" value={value.equipment.phone} onChange={(v) => setEq('phone', v)} />
      <Cell label="Desk, chair, monitor" value={value.equipment.furniture} onChange={(v) => setEq('furniture', v)} />
      <Cell label="Software, subscriptions" value={value.equipment.software} onChange={(v) => setEq('software', v)} />
      <Cell label="Other tools, PPE, cleaning" value={value.equipment.otherTools} onChange={(v) => setEq('otherTools', v)} />
      <Cell label="Professional books, journals" value={value.equipment.books} onChange={(v) => setEq('books', v)} />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">2D Communications</h3>
      <Cell
        label="Monthly internet + phone bill"
        labelDE="Internet/Telefon pro Monat"
        help="Deduction = min(20 % of bill, €20/month) × 12"
        value={value.monthlyInternet}
        onChange={(v) => patch({ monthlyInternet: v })}
      />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">2E Travel & training</h3>
      <Cell label="Business trips / client visits" value={value.businessTravel} onChange={(v) => patch({ businessTravel: v })} />
      <Cell label="Job-related training" labelDE="Fortbildungskosten" value={value.training} onChange={(v) => patch({ training: v })} />
      <Cell label="Job application costs" value={value.jobApplications} onChange={(v) => patch({ jobApplications: v })} />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">2F Memberships</h3>
      <Cell label="Union dues" labelDE="Gewerkschaftsbeiträge" value={value.unionDues} onChange={(v) => patch({ unionDues: v })} />
      <Cell label="Professional associations" value={value.professionalMemberships} onChange={(v) => patch({ professionalMemberships: v })} />

      <h3 className="text-xs font-semibold text-slate-500 uppercase mt-3">2G Double household</h3>
      <Cell label="Double household costs" labelDE="Doppelte Haushaltsführung" value={value.doubleHousehold} onChange={(v) => patch({ doubleHousehold: v })} />
      <Cell label="Weekly trips home" labelDE="Familienheimfahrten" value={value.weeklyTripsHome} onChange={(v) => patch({ weeklyTripsHome: v })} />

      <div className="border-t border-slate-200 pt-2 mt-3">
        <Cell kind="calc" label="Itemised total" labelDE="Summe Einzelposten" value={r.werbungskostenItemised} />
        <Cell
          kind="total"
          label="Effective Werbungskosten"
          labelDE="MAX(itemised, Arbeitnehmer-Pauschbetrag €1,230)"
          value={r.werbungskostenEffective}
          note={
            r.werbungskostenUsedPauschbetrag
              ? 'Pauschbetrag applied — it\'s higher than your itemised total'
              : 'Itemised total applied'
          }
        />
      </div>
    </Section>
  );
}
