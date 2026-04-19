import type { ReactNode } from 'react';

export function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <header className="cell-section px-4 py-2 flex items-baseline gap-3 rounded-t-lg">
        <span className="text-xs opacity-70">SECTION {number}</span>
        <h2 className="text-base">{title}</h2>
        {subtitle && <span className="text-xs opacity-70 ml-auto">{subtitle}</span>}
      </header>
      <div className="p-4 space-y-2">{children}</div>
    </section>
  );
}
