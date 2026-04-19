# Spreadsheet bugs corrected in the static-site port

The source spreadsheet `German_Tax_Complete_2025_2026.xlsx` contains formula bugs where
cell references point at empty or wrong cells in the `Rates` sheet. Each bug below
produces a visibly incorrect number in the xlsx; the static web app uses the **intended**
constant as documented by the row's label and help text.

| Cell | Label | xlsx formula (broken) | Fixed value / formula | Source of intent |
|---|---|---|---|---|
| K53 | Sparer-Pauschbetrag | `MIN(K52, Rates!B56)` — B56 is `0.02` (AfA rate) | `MIN(K52, 1000)` (`Rates!B33`) | Label says "Sparer-Pauschbetrag"; Rates!A33 matches |
| K55 | Capital gains tax | `K54 * Rates!B114` — B114 empty | `K54 * 0.25` (`Rates!B49`) | §32d EStG Abgeltungsteuer rate |
| K56 | Soli on KESt | `K55 * Rates!B115` — B115 empty | `K55 * 0.055` (`Rates!B50`) | SolZG always 5.5% on KESt |
| K79 | Commuting allowance | `IF(K76<=Rates!B114, …*Rates!B112, …*Rates!B113)` — all empty | `IF(km<=20, days·km·0.30, days·(20·0.30 + (km−20)·0.38))` for 2025; `days·km·0.38` for 2026 | `Rates!B36/B37/B38` |
| K84 | Home-office Pauschale | `MIN(K83,210) * Rates!B110` — B110 empty | `MIN(days, 210) * 6` (`Rates!B34`) | §4 Abs.5 Nr.6b EStG |
| K99 | Internet deduction | `MIN(Rates!B115, …*Rates!B116) * 12` — both empty | `MIN(20, bill*0.20) * 12` (`Rates!B39`, `B40`) | H 9.1 LStH |
| K115 | Effective Werbungskosten | `MAX(K114, Rates!B49)` — B49 is `0.25` (KESt rate) | `MAX(itemised, 1230)` (`Rates!B32`) | §9a EStG Arbeitnehmer-Pauschbetrag |
| K123 | Pension deduction cap | `MIN(..., Rates!B117)` — B117 empty | `MIN(..., 29344)` (`Rates!B41`) | §10 Abs.3 EStG |
| K166 | Kinderfreibetrag | `K9 * Rates!B110` — B110 empty | `K9 * 6384` (`Rates!B44`) | §32 Abs.6 EStG |
| K172 | Long-term care rate | Uses `Rates!B22` (ALV 1.3%) everywhere | Childless → `B19+B20` = 2.4%; with kids → `MAX(B19 − (k−1)·B21, 0.005)` | §55 SGB XI |
| K174 | KV contribution ceiling | `MIN(K24, Rates!B27)` — B27 is pension BBG | `MIN(gross, 66150)` (`Rates!B26`) | BBG KV/PV |
| K175 | PV contribution | `…* K168` — K168 is extraordinary-burden total | `MIN(gross, Rates!B26) * careRate(K172)` | §55 SGB XI |
| K187 | Grundfreibetrag pro-rata | `Rates!B11 * months/12` — B11 is `0.09` (church) | `12096 * months/12` (`Rates!B4`) | §32a EStG |
| K203 | Church tax | `IF(K13=1, …)` — K13 is empty | `IF(K8=1, …)` — K8 is the church-tax flag | Row label / section 0 |
| K235 | Tax-zone label | `IF(K195<=Rates!B11, …)` — B11 = 0.09 | Test against `grundfreibetrag`; per-year zone3 bound | §32a EStG |

## §32a tariff coefficients

The xlsx `Rates!B5/B6` zone boundaries and the zone-2/3 formula coefficients encoded in `K199`
produce visible discontinuities (~60 € jump at zvE 17,443; ~759 € jump at zvE 66,760). The
static site substitutes the official BMF coefficients per Jahressteuergesetz 2024:

**2025** — `z2_a: 932.30 / z3_a: 176.64 / z3_c: 1,015.13 / z4_const: 10,911.92 / z5_const: 19,246.67`,
with `zone3Upper: 68,480` (xlsx used 66,760).

**2026** — derived to be continuous at the published zone boundaries (`12,348 / 17,799 / 69,878`)
with marginal rates of 14 %, 23.97 %, and 42 % pinned at the right points.

## Structural corrections (product-team confirmed)

Beyond pointer fixes, these deeper German-tax corrections are also implemented:

- **Splittingverfahren (§32a Abs.5)** — joint filers compute `2 × E(zvE/2)`; xlsx uses single tariff only.
- **Soli Milderungszone (§3 SolZG)** — smooth phase-in between ESt 19,950 and ~33,912; xlsx uses a hard cliff.
- **§33 zumutbare Belastung** — 3-tier formula (income × 1–4 % brackets, adjusted for marriage and children) replaces the flat 3% `Rates!B42`.
- **§32d Günstigerprüfung for capital income** — when elected, capital income is added to zvE _and_ the separate Abgeltungsteuer is dropped (xlsx double-counts).
- **§51a Kirchensteuer loopback** — church tax is computed on the notional ESt that _includes_ the Kinderfreibetrag, not on ESt after `K201`.

All corrections are surfaced in-app via the per-row help text so users can see both the
xlsx's formula and what was actually applied.
