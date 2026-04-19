import { Section } from '../Section';
import { Cell } from '../Cell';
import { useSection } from '../../store/hooks';
import type { PersonalInfo } from '../../tax/types';

const STEUERKLASSE_LABELS = {
  1: 'I — Single',
  2: 'II — Single parent',
  3: 'III — Married, high earner',
  4: 'IV — Married, equal earners',
  5: 'V — Married, low earner',
} as const;

const GDB_OPTIONS = [0, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export function PersonalSection() {
  const { value, patch } = useSection('personal');
  return (
    <Section number="0" title="Personal details" subtitle="Persönliche Angaben">
      <SelectCell
        label="Tax class (Steuerklasse)"
        help="1=Single · 2=Single parent · 3=Married high earner · 4=Married equal · 5=Married low earner"
        value={value.steuerklasse}
        onChange={(v) => patch({ steuerklasse: v as PersonalInfo['steuerklasse'] })}
        options={Object.entries(STEUERKLASSE_LABELS).map(([k, label]) => ({
          value: Number(k), label,
        }))}
      />
      <Cell
        label="Church tax applicable?"
        labelDE="Kirchensteuerpflichtig"
        help="Members of a recognised church pay 8 % (BY/BW) or 9 % (elsewhere) of income tax"
        value={value.churchTax ? 1 : 0}
        onChange={(v) => patch({ churchTax: v > 0 })}
        integer
        min={0}
      />
      <SelectCell
        label="Bundesland"
        help="Only affects Kirchensteuer rate (BY/BW = 8 %, others = 9 %)"
        value={value.bundesland}
        onChange={(v) => patch({ bundesland: v as PersonalInfo['bundesland'] })}
        options={[
          { value: 'OTHER', label: 'Other Bundesland (9 %)' },
          { value: 'BY', label: 'Bayern (8 %)' },
          { value: 'BW', label: 'Baden-Württemberg (8 %)' },
        ]}
      />
      <Cell
        label="Children under 25"
        labelDE="Kinder unter 25"
        value={value.childrenUnder25}
        onChange={(v) => patch({ childrenUnder25: Math.max(0, Math.round(v)) })}
        integer
        min={0}
      />
      <SelectCell
        label="Degree of disability (GdB)"
        labelDE="Grad der Behinderung"
        help="Behinderten-Pauschbetrag ranges from €384 (GdB 20) to €2,840 (GdB 100)"
        value={value.disabilityGdB}
        onChange={(v) => patch({ disabilityGdB: Number(v) as PersonalInfo['disabilityGdB'] })}
        options={GDB_OPTIONS.map((g) => ({ value: g, label: g === 0 ? 'None' : String(g) }))}
      />
      <Cell
        label="Blind or severe care-needs?"
        labelDE="Blind / außergewöhnlich pflegebedürftig"
        value={value.blindOrSevereCare ? 1 : 0}
        onChange={(v) => patch({ blindOrSevereCare: v > 0 })}
        integer
        min={0}
      />
      <Cell
        label="Months resident in Germany"
        labelDE="Monate in Deutschland"
        help="Use 12 for a full year. Prorated Grundfreibetrag applies if < 12"
        value={value.monthsInGermany}
        onChange={(v) => patch({ monthsInGermany: Math.min(12, Math.max(0, Math.round(v))) })}
        integer
        min={0}
      />
      <Cell
        label="Married?"
        value={value.married ? 1 : 0}
        onChange={(v) => patch({ married: v > 0 })}
        integer
      />
      <Cell
        label="Joint assessment?"
        labelDE="Zusammenveranlagung (Splittingverfahren)"
        help="If yes, §32a Abs.5 Splittingverfahren is applied — usually beneficial for couples with unequal incomes"
        value={value.jointAssessment ? 1 : 0}
        onChange={(v) => patch({ jointAssessment: v > 0 })}
        integer
      />
    </Section>
  );
}

function SelectCell<T extends string | number>({
  label, labelDE, help, value, onChange, options,
}: {
  label: string;
  labelDE?: string;
  help?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid grid-cols-[1fr_160px] gap-2 items-center">
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-slate-700">{label}</span>
        {labelDE && <span className="text-xs text-slate-400 italic">{labelDE}</span>}
        {help && (
          <span
            title={help}
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold cursor-help"
          >
            ?
          </span>
        )}
      </div>
      <select
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((o) => String(o.value) === raw);
          if (match) onChange(match.value);
        }}
        className="cell-input px-2 py-1 rounded text-sm outline-none focus:bg-white"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
