import { useTaxStore } from '../store/useTaxStore';
import type { TaxYear } from '../tax/types';

const YEARS: TaxYear[] = [2025, 2026];

export function YearTabs() {
  const { year, setYear } = useTaxStore();
  return (
    <div className="flex gap-1 border-b border-slate-300">
      {YEARS.map((y) => (
        <button
          key={y}
          onClick={() => setYear(y)}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            year === y
              ? 'border-blue-600 text-blue-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  );
}
