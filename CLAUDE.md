# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Tax Simulator is a **static web app** for estimating German tax liability for tax years 2025
and 2026. It targets non-German speakers filing taxes for the first time. The user-facing
experience mirrors the product team's source spreadsheet (`German_Tax_Complete_2025_2026.xlsx`)
— a single scrollable "sheet" per tax year, with inputs and calculations laid out in rows
grouped by section, and a live-updating summary panel on the right.

**No backend.** All computation runs in the browser. Inputs are persisted to `localStorage`.
Comparable to TaxFix and ELSTER for estimation purposes.

## Tech Stack

- **React 18 + TypeScript + Vite** — static bundle, deployable to any CDN.
- **Tailwind CSS** — utility styling; spreadsheet colour coding via `.cell-input`,
  `.cell-calc`, `.cell-total`, `.cell-section` classes.
- **Zustand** (with `persist` middleware) — global inputs store, persisted to localStorage
  under key `taxsim-inputs-v1`.
- **decimal.js** — all tax arithmetic. Never use `number` / `float` for multi-step
  computation; the §32a quadratic zones and SS-contribution BBG caps accumulate IEEE-754
  drift.
- **Vitest + Testing Library** — unit tests for `tax/*` and component tests.

## Source of Truth

The product team's spreadsheet `German_Tax_Complete_2025_2026.xlsx` is the functional spec.
The xlsx ships with a set of formula bugs (references to empty / wrong `Rates!` cells). We
silently correct these in the web app — see `BUGS_FIXED.md` for the full list and rationale.

The web app additionally implements five structural corrections the xlsx omits:
Splittingverfahren, Soli Milderungszone, §33 3-tier zumutbare Belastung, Günstigerprüfung
for capital income, and §51a Kirchensteuer loopback with Kinderfreibetrag.

The `Rates` sheet is **locked** — values are baked into `src/tax/rates.ts` and users cannot
edit them.

## Development Commands

All commands run from `client/`:

```bash
npm install          # install dependencies
npm start            # dev server on :3000 (hot reload)
npm run build        # TypeScript compile + production bundle to dist/
npm run preview      # serve the built bundle locally
npm test             # Vitest watch mode
npm test -- --run    # Vitest single-pass (CI-style)
npm test -- src/tax/__tests__/tariff.test.ts   # run one test file
npm run deploy       # build + publish to GitHub Pages (gh-pages -d dist)
```

The Vite config sets `base: '/tax-calculator/'` for GitHub Pages — keep this in place for
any production build or preview.

## Architecture

```
client/src/
├── App.tsx                      # Shell: header + year tabs + 15-section grid + sticky summary
├── tax/                         # Pure calculation layer — no React imports
│   ├── types.ts                 # TaxInputs / PersonalInfo / all sectional input types
│   ├── rates.ts                 # Locked Rates-sheet values per tax year
│   ├── tariff.ts                # §32a 5-zone formula + Splittingverfahren
│   ├── calculator.ts            # Orchestrator — runs all 11 sections, returns CalculationResult
│   ├── income.ts                # Per-stream gross/net helpers (employment, freelance, trade…)
│   ├── sozialversicherung.ts    # KV/PV/RV/ALV with BBG caps + per-child PV rate
│   ├── werbungskosten.ts        # MAX(itemised, €1,230 Pauschbetrag)
│   ├── sonderausgaben.ts        # Pension, insurance, donations, childcare, school, church tax
│   ├── extraordinary.ts         # §33 3-tier zumutbare Belastung + §33a/b flat rates
│   ├── guenstigerpruefung.ts    # Kinderfreibetrag vs. Kindergeld election + KAP election
│   ├── kirchensteuer.ts         # §51a — computed on zvE with Kinderfreibetrag always applied
│   └── solz.ts                  # Solidaritätszuschlag with Milderungszone phase-in
├── store/
│   ├── useTaxStore.ts           # Zustand store — `inputs[year][section]` shape, resetYear action
│   └── hooks.ts                 # useSection<K>(key) — typed slice accessor for section components
└── components/
    ├── YearTabs.tsx             # 2025 / 2026 switch
    ├── Summary.tsx              # Sticky right-hand panel — calls calculate() and renders result
    ├── Section.tsx              # Reusable spreadsheet-style section card wrapper
    ├── Cell.tsx                 # Single labelled cell (input or calculated display)
    ├── MonthlyGrid.tsx          # 12-column monthly salary grid
    └── sections/                # One component per tax section (15 total)
        ├── PersonalSection.tsx
        ├── EmploymentSection.tsx
        ├── FreelanceTradeSection.tsx
        ├── RentalSection.tsx
        ├── CapitalSection.tsx
        ├── OtherIncomeSection.tsx
        ├── WerbungskostenSection.tsx
        ├── SonderausgabenSection.tsx
        ├── ExtraordinarySection.tsx
        ├── SozialversicherungSection.tsx
        ├── LossesSection.tsx
        ├── ZvESection.tsx
        ├── TaxComputationSection.tsx
        ├── WithholdingSection.tsx
        └── DashboardSection.tsx
```

### How section components read/write state

All section components use the `useSection<K>` hook from `store/hooks.ts`:

```ts
const { value, setValue, patch } = useSection('sonderausgaben');
```

This is the only correct pattern — do not reach into `useTaxStore` directly from sections.
`patch` does a shallow merge; `setValue` replaces the entire section object.

### Calculation flow (`src/tax/calculator.ts`)

`calculate(inputs: TaxInputs): CalculationResult` is the sole entry point. It:

1. Sums gross income across all streams (§19 employment incl. 12-month salary grid, §18
   freelance, §15 trade, §21 rental, §20 capital, §22 other).
2. Computes employee social-security contributions (KV/PV/RV/ALV with BBG caps and
   per-child PV rate).
3. Werbungskosten — MAX(itemised, Arbeitnehmer-Pauschbetrag €1,230).
4. Sonderausgaben (pension capped at €29,344, insurance, donations ≤20% income, childcare
   80% capped at €4,800/child, school fees 30% capped at €5,000, church tax paid).
5. Außergewöhnliche Belastungen with §33 3-tier zumutbare Belastung + §33a/b flat rates.
6. Loss offsets §10d (capped at current gross).
7. Prorate Grundfreibetrag by months in Germany. `zvE = max(0, Gesamtbetrag −
   Sonderausgaben − Außergewöhnliche − Verluste − Grundfreibetrag)`, floored to euros.
8. Tariff §32a (or `2 × E(zvE/2)` via Splittingverfahren for joint filers).
9. Günstigerprüfung — Kinderfreibetrag vs. Kindergeld; capital-income election.
10. §51a Kirchensteuer computed on notional ESt that re-adds the Kinderfreibetrag.
11. Solidaritätszuschlag with Milderungszone phase-in.
12. Result: `total tax owed − (Lohnsteuer + KiSt + SolZ + KESt withheld)`.

`Summary.tsx` calls `calculate()` directly on every render — no memoisation layer currently.

## What NOT to change without consulting `BUGS_FIXED.md`

The xlsx formulas look authoritative but many reference empty cells. Before altering a
calculation in `src/tax/` to "match the spreadsheet", re-read `BUGS_FIXED.md` — the
static-site numbers are intentionally different where the xlsx is broken.
