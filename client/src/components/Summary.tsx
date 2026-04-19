import { useTaxStore } from '../store/useTaxStore';
import { calculate } from '../tax/calculator';

const fmt = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);

const pct = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 1 }).format(n);

export function Summary() {
  const { year, inputs } = useTaxStore();
  const r = calculate(inputs[year]);
  const refundLabel = r.refundOrPayment >= 0 ? 'Refund' : 'Additional payment';
  const refundValue = Math.abs(r.refundOrPayment);
  const effectiveRate = r.gesamtbetrag > 0 ? r.totalTax / r.gesamtbetrag : 0;

  return (
    <aside className="sticky top-4 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        Summary — {year}
      </h2>
      <Row label="Total gross income" value={fmt(r.gesamtbetrag)} />
      <Row label="− Werbungskosten" value={fmt(r.werbungskostenEffective)} muted />
      <Row label="− Sonderausgaben" value={fmt(r.sonderausgaben)} muted />
      <Row label="− Außergewöhnliche" value={fmt(r.extraordinary)} muted />
      <Row label="− Grundfreibetrag" value={fmt(r.grundfreibetragProrata)} muted />
      <Row label="Taxable income (zvE)" value={fmt(r.zve)} bold />
      <div className="border-t border-slate-200 pt-3">
        <Row label="Einkommensteuer" value={fmt(r.estAfterCredits)} />
        <Row label="Solidaritätszuschlag" value={fmt(r.solz)} />
        <Row label="Kirchensteuer" value={fmt(r.kirchensteuer)} />
        {r.capitalTax > 0 && <Row label="Abgeltungsteuer" value={fmt(r.capitalTax)} />}
      </div>
      <div className="border-t border-slate-200 pt-3">
        <Row label="Social security (employee)" value={fmt(r.sozialversicherung.total.toNumber())} muted />
        <Row label="Total tax" value={fmt(r.totalTax)} bold />
        <Row label="Effective rate" value={pct(effectiveRate)} muted />
        <Row label="Net take-home" value={fmt(r.netTakeHome)} bold />
      </div>
      <div
        className={`border-t pt-3 font-semibold ${
          r.refundOrPayment >= 0 ? 'text-emerald-700' : 'text-rose-700'
        }`}
      >
        <Row label={refundLabel} value={fmt(refundValue)} bold />
      </div>
    </aside>
  );
}

function Row({
  label, value, bold, muted,
}: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-baseline text-sm">
      <span className={muted ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
      <span
        className={`tabular-nums ${
          bold ? 'font-semibold text-slate-900' : muted ? 'text-slate-500' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
