import type { Monthly, Month } from '../tax/types';
import { MONTHS } from '../tax/types';

const euroFmt = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0, maximumFractionDigits: 2,
});

export function MonthlyGrid({
  label, labelDE, value, onChange, help,
}: {
  label: string;
  labelDE?: string;
  value: Monthly;
  onChange: (next: Monthly) => void;
  help?: string;
}) {
  const total = Object.values(value).reduce((a, b) => a + b, 0);

  return (
    <div className="border border-slate-200 rounded p-2 bg-slate-50">
      <div className="flex items-baseline gap-2 mb-2">
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
        <span className="ml-auto text-xs text-slate-500">Annual:</span>
        <span className="cell-total px-2 py-0.5 rounded text-sm tabular-nums font-semibold">
          € {euroFmt.format(total)}
        </span>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {MONTHS.map((m) => (
          <MonthInput
            key={m}
            month={m}
            value={value[m]}
            onChange={(v) => onChange({ ...value, [m]: v })}
          />
        ))}
      </div>
    </div>
  );
}

function MonthInput({
  month, value, onChange,
}: {
  month: Month; value: number; onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col items-stretch">
      <span className="text-[10px] text-slate-500 text-center uppercase tracking-wide">
        {month}
      </span>
      <input
        type="number"
        step={0.01}
        min={0}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => {
          const n = e.target.value === '' ? 0 : Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="cell-input px-1 py-1 rounded text-xs text-right tabular-nums w-full outline-none focus:bg-white"
      />
    </label>
  );
}
