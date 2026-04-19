import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';

const euroFmt = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type CellKind = 'input' | 'calc' | 'total';

type BaseProps = {
  label: string;
  labelDE?: string;
  help?: string;
  note?: ReactNode;
  indent?: number;
};

type InputProps = BaseProps & {
  kind?: 'input';
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  unit?: string;
  integer?: boolean;
};

type DisplayProps = BaseProps & {
  kind: 'calc' | 'total';
  value: number;
  unit?: string;
};

export type CellProps = InputProps | DisplayProps;

export function Cell(props: CellProps) {
  const { label, labelDE, help, note, indent = 0 } = props;
  const bgClass =
    props.kind === 'total' ? 'cell-total' : props.kind === 'calc' ? 'cell-calc' : 'cell-input';

  return (
    <div className="grid grid-cols-[1fr_160px] gap-2 items-center">
      <div className="flex items-baseline gap-2" style={{ paddingLeft: indent * 16 }}>
        <span className="text-sm text-slate-700">{label}</span>
        {labelDE && <span className="text-xs text-slate-400 italic">{labelDE}</span>}
        {help && <HelpBadge text={help} />}
      </div>
      <div className={`${bgClass} px-2 py-1 rounded text-sm text-right tabular-nums`}>
        {props.kind === 'input' || props.kind === undefined ? (
          <InputField {...(props as InputProps)} />
        ) : (
          <span>{formatValue(props.value, props.unit)}</span>
        )}
      </div>
      {note && <div className="col-span-2 text-xs text-slate-500 italic pl-1">{note}</div>}
    </div>
  );
}

function InputField({ value, onChange, step, min, unit, integer }: InputProps) {
  const [local, setLocal] = useState(value === 0 ? '' : String(value));
  const prevValue = useRef(value);

  // Sync local when external value changes (e.g. year switch or reset)
  useEffect(() => {
    if (value !== prevValue.current) {
      setLocal(value === 0 ? '' : String(value));
      prevValue.current = value;
    }
  }, [value]);

  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number"
        inputMode={integer ? 'numeric' : 'decimal'}
        step={step ?? (integer ? 1 : 0.01)}
        min={min}
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          const n = e.target.value === '' ? 0 : Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-full bg-transparent text-right outline-none focus:bg-white rounded"
        placeholder="0"
      />
      {unit && <span className="text-slate-500 text-xs">{unit}</span>}
    </div>
  );
}

function formatValue(v: number, unit?: string) {
  if (unit === '%') return `${(v * 100).toFixed(2)} %`;
  if (unit && unit !== '€') return `${v} ${unit}`;
  return `€ ${euroFmt.format(v)}`;
}

function HelpBadge({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More information"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-blue-500 text-white text-[11px] font-bold italic leading-none cursor-help shadow-sm ring-1 ring-blue-600/20 hover:bg-blue-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 w-60 px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-normal not-italic leading-snug shadow-lg pointer-events-none"
        >
          {text}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
        </span>
      )}
    </span>
  );
}
