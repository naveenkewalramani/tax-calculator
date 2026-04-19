import { YearTabs } from './components/YearTabs';
import { Summary } from './components/Summary';
import { PersonalSection } from './components/sections/PersonalSection';
import { EmploymentSection } from './components/sections/EmploymentSection';
import { FreelanceTradeSection } from './components/sections/FreelanceTradeSection';
import { RentalSection } from './components/sections/RentalSection';
import { CapitalSection } from './components/sections/CapitalSection';
import { OtherIncomeSection } from './components/sections/OtherIncomeSection';
import { WerbungskostenSection } from './components/sections/WerbungskostenSection';
import { SonderausgabenSection } from './components/sections/SonderausgabenSection';
import { ExtraordinarySection } from './components/sections/ExtraordinarySection';
import { SozialversicherungSection } from './components/sections/SozialversicherungSection';
import { LossesSection } from './components/sections/LossesSection';
import { ZvESection } from './components/sections/ZvESection';
import { TaxComputationSection } from './components/sections/TaxComputationSection';
import { WithholdingSection } from './components/sections/WithholdingSection';
import { DashboardSection } from './components/sections/DashboardSection';
import { useTaxStore } from './store/useTaxStore';

export default function App() {
  const { year, resetYear } = useTaxStore();

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900">
          Tax Simulator — German Income Tax
        </h1>
        <span className="text-xs text-slate-500">
          For estimation only · not tax advice · verify via ELSTER
        </span>
        <button
          onClick={() => {
            if (confirm(`Reset all inputs for ${year}?`)) resetYear(year);
          }}
          className="ml-auto text-xs text-slate-500 hover:text-rose-600 underline"
        >
          Reset {year}
        </button>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <YearTabs />
        <div className="text-xs text-slate-500 mt-2 mb-4 flex gap-4">
          <span><span className="cell-input inline-block px-2 rounded">blue/yellow</span> = your input</span>
          <span><span className="cell-calc inline-block px-2 rounded">green/blue</span> = auto-calculated</span>
          <span><span className="cell-total inline-block px-2 rounded">grey</span> = totals</span>
        </div>

        <div className="grid grid-cols-[1fr_340px] gap-4">
          <main className="space-y-4">
            <PersonalSection />
            <EmploymentSection />
            <FreelanceTradeSection />
            <RentalSection />
            <CapitalSection />
            <OtherIncomeSection />
            <WerbungskostenSection />
            <SonderausgabenSection />
            <ExtraordinarySection />
            <SozialversicherungSection />
            <LossesSection />
            <ZvESection />
            <TaxComputationSection />
            <WithholdingSection />
            <DashboardSection />
          </main>

          <div>
            <Summary />
          </div>
        </div>

        <footer className="text-xs text-slate-400 text-center py-6">
          Inputs auto-save to your browser · No data sent to any server
        </footer>
      </div>
    </div>
  );
}
