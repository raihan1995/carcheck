# Changelog

Project history for **RevVeal** (UK Car Check). Use this when you need to see what changed, or to roll back a UI generation.

---

## UI revamp 5.1 — 25 November 2026 (current)

Restores the distinctive registration and vehicle-history visuals within the refreshed RevVeal layout.

- **British registration plates:** restored the Union Jack and GB identifier in the blue band, across search fields, full-size plates and compact saved-car plates.
- **Vehicle details heading:** removed the “DVLA record” badge, including its sample variant.
- **Pricing comparison:** added RevVeal’s planned £5.99 full report beside VehicleScore at £13.95 and carVertical at £39.99. The single-report comparison has provider pricing links, a 25 November 2026 check date, responsive cards and clear planned-service wording for RevVeal. Competitor prices were verified on the providers' own pages, including carVertical's browser-loaded price. This compares prices without claiming identical report coverage.
- **Report coverage cards:** expanded “What the free records cannot tell you” with the reference's six categories: Risk checks, MOT history, Mileage, Ownership, Vehicle spec and Status & value. Added their summaries and detailed checklists, orange icons, dashed dividers and a responsive three/two/one-column layout. Labels distinguish free checks, signed-in catalogue information and planned full-report checks; the pricing link remains and paid checks are still marked unavailable.
- **Road tax wording:** renamed “Estimated road tax” to “Road tax”, hid “Standard rate from the second tax payment” and removed the sentence about the V5C issue date. Kept the tax-cost estimates note, payments, other tax bases, supplement information and DVLA rates link.
- **MOT, tax and London ULEZ:** restored full green backgrounds for positive results and red backgrounds for negative results. SORN and unavailable/unconfirmed information use an amber background with an explicit label.
- **Mileage information:** restored horizontal odometer bars by year and the original summary details. Mileage changes sit inside the coloured fill, 6px from its right edge; very short fills keep enough width for the label. Bars use the latest valid reading in each year, convert recognised kilometre readings to miles and retain the warning for decreases across all original readings.
- **Mileage wording:** replaced “No decrease found” with “No Mileage Alteration Detected”. Removed the asterisk, guarantee note and explanatory paragraphs beneath the chart. Recorded decreases retain “Review readings” and the specific decrease warning, linked for assistive technology.
- **CO₂ emission figures:** restored the green-to-red stepped comparison graph, recorded g/km and a clearly marked active band. Unavailable figures have an explicit empty state. Comparison bands do not imply a tax charge or ULEZ result.
- **MOT history:** restored green pass and red fail panels, amber minor/advisory items, red major/dangerous items, a colour key and matching summary counters. Text labels accompany every colour. The legacy dangerous flag takes precedence when classifying a defect.
- **MOT summary:** restored total tests, passed and failed counts at the bottom of “MOT at a glance”, with the rounded pass percentage, passed/total test ratio and a green progress bar. Counts use actual recorded tests, including retests; missing history has an unavailable state, and empty history has no pass percentage.
- **MOT at a glance wording:** removed “Counts across all available tests, including past issues.” The unavailable-history message remains when counts cannot be calculated.
- **Vehicle Performance and Misc information:** renamed Catalogue specifications, restored 0–60 mph, torque, engine size, fuel, cylinders, valves and drivetrain alongside power, transmission and top speed. Restored the Misc information panel with new price, MPG, insurance group, capacities, weight, dimensions, doors, seats and boot space. Both panels follow the selected variant and retain the sign-in lock. Both API methods withhold catalogue candidates until the Supabase user is verified, including for the sample check; the sign-in button returns to the vehicle being viewed.
- **Report layout:** Vehicle details is followed by Mileage information, then Vehicle Performance with Misc information on its right, then the full-width CO₂ emission figures card and MOT history. The Performance/Misc pair stacks when the available report column is narrow. CO₂ retains the compact figures/bars and active-band outline, without the visible “Your car” label.
- **Tax & registration:** restored estimated 6-month, 12-month and monthly Direct Debit totals using the original registration-period logic, extracted to `lib/vehicle-tax.ts` and updated to 2026–27 GOV.UK rates. Includes first-registration rates for recent cars and a conditional supplement note. Missing data, unsupported vehicle classes and the unresolved March 2006 high-emissions cutoff do not produce guessed prices. Removed the extra “Confirm ULEZ with TfL” link from this section; the verification link remains in London ULEZ estimate.
- **Homepage recent checks:** plain bordered registration text is listed beneath “Recent checks”. Removed the “See a sample report / Know what to look for” line below the search field.
- **Header navigation:** moved the desktop links slightly right, closer to the account controls, with responsive spacing that eases off on narrower screens.
- **Homepage car visual:** replaced the static photograph frame with a transparent burnt-orange car illustration, orange contours, gentle car movement, pointer parallax and a reveal sweep that reacts to the registration search. Added pause/resume, offscreen pausing and reduced-motion support. Removed both lines of the caption beneath the image. Artwork and generation prompt are recorded in `docs/DESIGN.md`.
- **Hero headline and inspection effect:** removed the line above the headline and increased the responsive headline size to 76px on wide screens, with larger mobile text. Strengthened the scan beam and added a trailing inspection band plus timed highlights anchored to the car. All effects share pause, offscreen and reduced-motion controls, and start after the car image loads.
- **Random scan findings:** removed the visible “Illustrative scan” label. Each sweep selects one to three findings from 24 short labels, including Oil leak, Low tread, Steering play, Wiper wear, Exhaust leak and Corrosion. Labels have at most two words, appear at the relevant car area as the beam passes, and do not repeat from the previous sweep. Oil leak is anchored to the engine bay; selected locations use layouts that keep their labels apart.
- **Results header:** removed the “Retrieved … (UK time)” timestamp and the “Free vehicle check” badge beside the registration plate.
- **London ULEZ:** restored “Compliant”, “Not compliant” and “Unknown” with green, red and amber panels. Restored the previous DVLA Euro → suggested catalogue Euro → registration-date fallback order, including amber for older diesels without a Euro record. The heading now reads “London ULEZ”; removed the detail line such as “DVLA · Euro 6” and its separator. Every outcome retains the underlined “Verify on TfL” link inside the panel. The estimate is calculated before withholding signed-in-only performance figures, so it is available to all users; hybrids use their combustion-engine standard.

**Pricing comparison validation:** Production build and ten viewport checks from 320 to 1920px passed, including the 700px stacking breakpoint. Confirmed all three prices, both source links, keyboard access, the checked date and the disabled checkout. Three automated accessibility checks passed, with no horizontal overflow or client exceptions.

**Report coverage validation:** Production build and nine viewport checks from 320 to 1920px passed. Confirmed all six categories and nineteen checklist items, responsive columns, availability labels and the pricing link. Three automated accessibility checks and print generation passed, with no horizontal overflow or client exceptions.

**Validation:** Production build and TypeScript checks passed, along with all seventeen regression tests. Browser checks covered 20 page/viewport combinations at 320, 390, 768, 1024 and 1440px, with five automated WCAG A/AA checks. Green/red/amber results, all defect severities, mileage decreases, zero/missing CO₂ and empty MOT history were checked. No horizontal overflow or client exceptions were found.

**Performance lock and homepage follow-up:** API tests cover verified, anonymous and invalid sessions for GET/POST and sample checks. Anonymous GET/POST responses were also checked against the running app. Thirteen additional viewport checks and five automated accessibility checks passed for recent-check placement, locked/unlocked performance layouts and the return-to-vehicle sign-in link. Signed-in rendering used response fixtures; no real account was created or signed in.

**Report layout and restored fields validation:** Production build and all 24 tests passed, including seven tax-calculation regression tests. Eleven viewport checks from 320 to 1920px confirmed the section order, paired/stacked cards and mileage labels inside their fills. Response fixtures verified locked/unlocked Performance and Misc panels, variant changes, missing matches, the three tax periods, unavailable six-month payments, missing tax inputs, recent registrations and very short/decreasing mileage bars. Print output and five automated accessibility checks passed, with no horizontal overflow or client exceptions. Tax sources were checked on 25 November 2026: [2017-onward rates](https://www.gov.uk/vehicle-tax-rate-tables), [2001–2017 rates](https://www.gov.uk/vehicle-tax-rate-tables/rates-for-cars-registered-on-or-after-1-march-2001) and [pre-2001 rates](https://www.gov.uk/vehicle-tax-rate-tables/rates-for-cars-and-light-goods-vehicles-registered-before-1-march-2001).

**Section order follow-up:** moved the Performance/Misc pair below Mileage information and above CO₂ emission figures. Production build and ten browser checks passed across 320, 390, 820, 1024 and 1440px, covering locked and unlocked response fixtures, visual/DOM order and responsive stacking, with no horizontal overflow or client exceptions.

**ULEZ follow-up validation:** Regression cases cover Euro-source precedence, registration cutoffs, motorcycles, hybrid fuels and missing data. All three colour outcomes were checked at 320, 390 and 1440px, including the inline TfL link, keyboard focus, print colours and automated accessibility. Missing fuel still leaves the verification link visible. Mobile checks also confirm the link stays on one line within the panel.

**MOT summary follow-up validation:** The production build passed. Browser fixtures verified 11 total tests, 9 passed and 2 failed produce 82% and 9/11 tests at 320, 390, 1024 and 1440px. Unavailable, empty and unclassified histories were also checked, with no horizontal overflow or client exceptions. Automated accessibility checks passed for the summary and unclassified-result states.

**Homepage car visual validation:** Production build and nine viewport checks from 320 to 1920px passed. Verified pointer response, registration-field focus, keyboard pause/resume, offscreen pausing and reduced-motion behaviour. Automated accessibility checks passed in both motion modes, with no client exceptions or horizontal overflow. The desktop image was served by Next Image as a 39KB WebP; the transparent source and full built-in generation prompt are documented in `docs/DESIGN.md`.

**Headline and inspection follow-up:** Production build and ten viewport checks from 320 to 1920px passed. The larger headline stays on two lines. Timed animation checks confirmed that the brake and tyre highlights appear after the scan reaches each wheel. All seven effects pause through the keyboard control and when offscreen, and reduced-motion preferences disable them. Automated accessibility checks passed, with no client exceptions or horizontal overflow.

**Random scan validation:** The build and all 17 tests passed, including 1,000 deterministic selections checking the three-label limit, short labels, distinct areas and no immediate repeats. Accelerated browser checks exercised 75 scan boundaries and displayed all 24 labels, including Oil leak at the engine bay. Checked nine viewport widths, mobile label separation, pause/resume, offscreen and reduced-motion behaviour, accessibility and hydration; no client or hydration errors were found.

See [docs/DESIGN.md](./docs/DESIGN.md) for the shared design and data rules.

---

## RevVeal UI redesign — 25 November 2026

**Theme:** Restrained vehicle-check interface inspired by the supplied reference screenshots: navy text, white/off-white surfaces, burnt orange actions, yellow UK registration plates and a dark footer.

**Brand retained:** The website is RevVeal. The references guide the layout, not the brand name. The homepage headline, wordmark and supporting copy retain the rev/reveal wordplay: “RevVeal your car's history.”

### What changed

| Area | Changes |
|------|---------|
| **Shared design system** (`app/globals.css`, `app/layout.tsx`, `app/components/`) | Outfit headings and Inter body text; named colour, type and spacing tokens; 1200px content width; 8–12px corners; light borders; a consistent SVG outline icon set; typographic RevVeal branding |
| **Home** (`app/page.tsx`) | Registration-led hero with an optimised car photograph; orange primary search button; trust points; free/full comparison table; illustrative report preview; FAQ and dark footer. No floating chips, gradients, emojis or unverified price claims |
| **Free results** (`app/vehicle/[registration]/page.tsx`, `VehicleResults.tsx`) | Vehicle summary, supplied MOT/tax statuses, labelled ULEZ estimate, mileage chart, newest-first MOT timeline, catalogue variant selector, sources and retrieval time. Paid checks appear honestly as not checked. Loading, empty, partial-data and retry states are explicit |
| **Full report** (`app/report/[id]/page.tsx`) | Sections for stolen records, finance, write-offs, mileage analysis, plate changes and valuation; clear/attention/not-checked indicators; browser “Save as PDF”. Owned completed reports read their stored Supabase snapshot rather than running a fresh lookup |
| **Dashboard** (`app/dashboard/`) | Left sidebar, greeting, three stat cards, recent cars and quick actions. Added My cars, Reminders, Activity, Logbook and Tax alerts; retained Reports, Payment history and Settings. Sidebar becomes a disclosure menu on mobile |
| **Accounts and supporting pages** | Restyled sign-in, registration, recovery, settings and contact flows. Added Pricing, FAQ, free/full Comparison, Guides and article layouts, plus clearly marked draft Privacy, Terms and Security pages |
| **Accessibility and mobile** | Skip link, visible focus rings, labelled fields and errors, native FAQ disclosures, underlined text links, reduced-motion support, responsive tables and thumb-friendly controls |

### Behaviour and data changes

- Registration submission navigates directly to one results lookup instead of fetching the same report on both the home and results pages.
- Vehicle response types and summary calculations are shared modules. MOT/tax statuses use the provider's fields rather than date guesses; mileage calculations convert recognised kilometre readings to miles and retain original readings in the timeline.
- ULEZ estimates use confirmed emissions information, distinguish electric hybrids from fully electric vehicles, and link to TfL for confirmation.
- The previous calculated road-tax and CO₂-band panels are replaced by vehicle data and links to official tax rates. Catalogue details are labelled possible matches and are no longer hidden behind a visual account lock.
- API responses include a retrieval timestamp. Provider requests have timeouts, and optional catalogue failures do not discard available vehicle data. Missing DVLA configuration returns an unavailable response; only the explicit `SAMPLE` registration returns illustrative data.
- Auth redirect paths are validated against a trusted origin, and sign-out/settings/report-loading failures have explicit error handling.

### Preview routes and service limits

- `/vehicle/SAMPLE`: illustrative free report. `/report/SAMPLE`: illustrative full-report layout and PDF printing.
- `/preview/dashboard`: public layout preview; it does not authenticate or load private account reports.
- Saved cars, recent checks and reminder dates are **browser-local**, not synchronised with accounts or other devices. Reminder dates support calendar export.
- The planned full-report price is **£5.99 incl. VAT**. Paid-data providers, checkout, generated/emailed PDFs and automatic tax/V5C notifications are **not connected**; the interface states this explicitly.
- Confirmed business/VAT details, support/security contacts and reviewed legal content remain `[PLACEHOLDER]`. Final brand photography/logo assets are still needed.

### Validation

- Production build and TypeScript validation passed, along with six regression tests for source statuses, hybrid classification, mileage units/date parsing, auth redirects and preserving saved cars through the branding correction.
- Browser checks passed on 13 public pages, including automated WCAG A/AA checks, plus 24 viewport checks at 320, 390, 768 and 1024px.
- RevVeal branding was rechecked on the homepage, sign-in, dashboard preview and sample results at 320, 390 and 1440px, with no horizontal overflow or client exceptions.
- Search validation, single-lookup behaviour, browser-local saving, mocked provider failure/retry, anonymous route guards, mobile keyboard navigation and PDF rendering were checked. Real account sign-in and external paid/notification services were not exercised.

See [docs/DESIGN.md](./docs/DESIGN.md) for the design system, route map and remaining integration/content work.

---

## UI revamp 4.5 — Auto Trader white + orange

**Theme:** Clean white marketplace palette (Auto Trader–inspired) with original orange accent
(`#f59e0b`). Keeps v4 editorial fonts and layout; retires dark/brass colours and film grain.

**Status:** Committed on `main`.  
**Baseline to revert to UI 4.0:** commit `d23cbe6` on `main`.

### Revert to UI 4.0

```bash
git checkout d23cbe6 -- app/globals.css app/layout.tsx app/page.tsx app/components/ app/contact/ app/dashboard/ app/login/ app/register/ app/forgot-password/ app/reset-password/ "app/vehicle/[registration]/page.tsx" public/img/revveal.png
```

### What changed (4.5)

| Area | Changes |
|------|---------|
| **Design tokens** (`app/globals.css`) | White `#ffffff` background; darker muted text (`#525252` / `#262626`); body line-height 1.625; grain overlay off; looser kicker tracking (12px / 0.18em); Fraunces letter-spacing reset |
| **Logo** (`RevVealLogo.tsx`) | PNG wordmark from `public/img/revveal.png`; compact header size `h-11 sm:h-12` |
| **Home** (`app/page.tsx`) | Editorial asymmetric hero (no full-width banner); headline **Re** / **veal** / *whole* styling; readable form labels; tighter hero leading |
| **Vehicle page** | Light-theme status colours; sans semibold section headings; **CO₂ chart** active row uses band-matched light tints (e.g. lime-50 for D–E) instead of dark lime overlay |
| **Auth & dashboard** | Form labels use readable body style; `text-muted-strong` for supporting copy; section headings sans semibold |
| **Contact** | Semibold email link (sans display) |
| **Header** | Light frosted bar with subtle shadow |

**Unchanged on purpose:** Fraunces / Space Grotesk / JetBrains Mono type system, editorial structure, UK plate styling, all app logic.

---

## UI revamp 4.0 — "Garage Atelier"

**Theme:** Dark editorial. Warm ink background, brass/gold accent (replaces flat amber),
hairline rules instead of glassy cards, high-contrast serif display over a grotesk body.
Designed to read like a printed car magazine rather than a generated SaaS template.

**Status:** Committed on `main` (`d23cbe6`).  
**Baseline to revert to UI 3.0:** commit `fe634f5` on `main` (last UI 3.0 commit).

### Revert to UI 3.0

```bash
# Restore all UI-related files from the last UI 3.0 commit
git checkout fe634f5 -- app/globals.css app/layout.tsx app/page.tsx app/components/ app/contact/ app/dashboard/ app/login/ app/register/ app/forgot-password/ app/reset-password/ "app/vehicle/[registration]/page.tsx"
```

Or check out the whole tree at that commit in a new branch:

```bash
git checkout -b ui-3.0-restore fe634f5
```

### What changed (4.0)

| Area | Changes |
|------|---------|
| **Type system** (`app/layout.tsx`) | Fraunces (display serif), Space Grotesk (body), JetBrains Mono (figures) via `next/font`, wired to CSS variables |
| **Design tokens** (`app/globals.css`) | Warm ink palette (`--background #0b0a08`), brass `--accent #c9a35a` + `--accent-strong`/`--accent-soft`, `--hairline`; film-grain overlay, `.kicker`, `.section-index`, `.link-underline`, `.contour` motif utilities |
| **Brand** (`RevVealLogo.tsx`) | Typographic "Rev**Veal**." wordmark in Fraunces (retired PNG logo); brass second-half plays on the "reveal" pun |
| **Header** (`SiteHeader.tsx`) | Slim transparent bar, hairline border, animated underline nav, pill Register CTA, numbered mobile drawer |
| **Home** (`app/page.tsx`) | Asymmetric editorial hero, large serif headline, search as an underlined field with a GB plate band, "Inside every check" index column, contour motif |
| **Vehicle page** (`app/vehicle/[registration]/page.tsx`) | Editorial masthead with make as headline + plate object, tax/MOT/ULEZ status strip, hairline section cards with kicker labels, brass charts, restyled loading/error/MOT history |
| **Auth** (`AuthShell` + forms + fields) | Two-column editorial split with brand panel + contour, underline inputs, brass buttons |
| **Dashboard** (`layout`, `DashboardNav`, reports, receipts, settings) | Serif headings, underline tabs, hairline list rows, outline buttons |
| **Contact** (`app/contact/`) | Editorial hero, oversized serif email link |

**Unchanged on purpose:** UK plate stays statutory yellow (`#FFD132`) with a GB band. The EU CO₂ band colours and MOT defect-severity colours stay semantic. No logic changes — all data, auth and calculation code is untouched.

---

## UI revamp 3.0 — Dark theme

**Status:** Committed on `main` (`6a8da9f` … `fe634f5`).  
**Baseline to revert to UI 2.0:** commit `052b5b1` on `main`.

### Revert to UI 2.0

```bash
# Restore only UI-related files from the last light-theme commit
git checkout 052b5b1 -- app/globals.css app/layout.tsx app/page.tsx app/components/ app/contact/ "app/vehicle/[registration]/page.tsx"
```

Or check out the whole tree at that commit in a new branch:

```bash
git checkout -b ui-2.0-restore 052b5b1
```

### What changed (3.0)

| Area | Changes |
|------|---------|
| **Design tokens** (`app/globals.css`) | Dark palette: `--background #0a0a0f`, `--card #12121a`, `--foreground #e2e8f0`, `--surface`, `--muted`, amber `--accent` |
| **Layout** (`app/layout.tsx`) | `bg-background text-foreground` on `html` / `body` |
| **Header** (`app/components/SiteHeader.tsx`) | Dark sticky header, amber active nav, dark mobile drawer |
| **Logo** (`app/components/RevVealLogo.tsx`) | Light `REV` / speedometer strokes for dark backgrounds |
| **Home** (`app/page.tsx`) | Dark gradient shell, glassy card form, amber CTA, dark recent-check chips |
| **Contact** (`app/contact/`) | Dark cards, amber email link, dark copy button |
| **Vehicle page** (`app/vehicle/[registration]/page.tsx`) | Full dark pass: loading/error states, section cards, ULEZ/tax/MOT banners (dark tinted), performance beta, mileage chart, CO₂ bands, MOT history, demo banner |

**Unchanged on purpose:** UK plate styling stays yellow (`#FFD132`) with a dark border.

---

## UI revamp 2.0 — Light theme

**Last commit on `main` before 3.0:** `052b5b1`  
**Introduced around:** `51dea65` (“re-work UI, add logo new name, columns”)

### Characteristics

- Plus Jakarta Sans
- Light gradient backgrounds (`slate-50` / white)
- Elevated white cards, soft shadows
- Amber accents and CTAs
- RevVeal logo and site header with burger menu
- Two-column vehicle layout on large screens

### Revert to pre–UI 2.0

```bash
git checkout 51dea65^ -- app/
```

(Adjust path/commit if you only need an earlier snapshot.)

---

## Feature history (all versions)

The tables below describe the earlier UI generations, including UI 2.0 (`052b5b1`) and UI 3.0. They are historical records, not a statement of current RevVeal behaviour; see the current redesign entry above for replacements and service limits.

### Data & API

| Feature | Notes |
|---------|--------|
| DVLA Vehicle Enquiry Service | Make, colour, fuel, tax, MOT status, CO₂, Euro status, etc. |
| MOT History API | `https://history.mot.api.gov.uk` — registration in path, `defects` mapped to `rfrAndComments` |
| Demo mode | Works without API keys; banner when using demo data |
| Umami analytics | Optional via env (`967d86c`) |

### Vehicle results page

| Feature | Commit / area |
|---------|----------------|
| Vehicle details grid | DVLA fields; trimmed list (no monthOfFirstDvlaRegistration, artEndDate, RDE on display) |
| ULEZ compliance | Euro-based rules; **unknown** (amber) for pre–Sep 2015 diesels without DVLA Euro status (`5b97906`) |
| Tax & MOT status cards | Days left; “Expired” + GOV.UK / Book MOT links when invalid |
| MOT 3-year exemption | New cars: “MOT not required until …” (`eaf9ab8`) |
| Road tax | Post-2017 CO₂ bands, 2001–2017 bands, pre-2001 engine size; £40k supplement note (`633e798`, `dfc1201`) |
| CO₂ emission band chart | EU-style A–L/M bars with active band highlight (`28c5db8`, `cd0f188`) |
| MOT summary | Pass/fail counts and bar |
| MOT history list | Per-test result, date, mileage, defects/advisories |
| Yearly average mileage | From first registration (0 mi) to latest MOT (`10dba05` area) |
| Yearly odometer chart | Latest reading per calendar year (`5313d15`) |
| Year-on-year `+miles` | Inside amber bar on the year miles were **added** (`f53d1c8`, `052b5b1`) |
| Mileage issue detection | Same-day retest handling; decreasing odometer flag (`34dc02f`, `ac7841a`) |
| Likely imported heuristic | ≤2 MOTs, ≥9 years, 0 g/km CO₂; month-match rules (`df80dac`–`b8027c1`) |
| **Vehicle performance (Beta)** | CSV spec lookup; trim dropdown; suggested default; BHP, torque, gearbox, 0–60, top speed (`e844267`) |

### Home & site

| Feature | Notes |
|---------|--------|
| Recent registration chips | Last 5 from `localStorage` (`10dba05`) |
| Site header + Contact page | Logo, nav, `support@revveal.co.uk` + copy (`674090e`) |
| Brand | RevVeal name and logo (`51dea65`) |

### Car specs data pipeline

| Step | Command / path |
|------|----------------|
| Preprocess Kaggle-style CSV | `npm run preprocess-cars` → `data/make-specs-index.json`, `data/specs/*.csv` |
| Lookup | `lib/car-specs-lookup.ts` — `getSpecCandidates()`, MOT model-family rules |
| API | `/api/check` returns `specCandidates` + `suggestedSpecId` (no auto-apply) |

---

## Commit reference (recent)

| Commit | Summary |
|--------|---------|
| `052b5b1` | Mileage delta on correct year bar — **last UI 2.0 commit on `main`** |
| `f53d1c8` | Year-on-year mileage delta in bar |
| `5b97906` | ULEZ fix pre-2015 diesel / missing Euro |
| `e844267` | Performance beta + trim picker |
| `633e798` | Road tax rework |
| `674090e` | Contact page + email copy |
| `5313d15` | Yearly odometer chart |
| `51dea65` | UI 2.0 kickoff — logo, columns, layout |
| `fdf7665` | `IMPROVEMENTS.md` (planning doc, repo root) |

---

## Planning / not implemented

See `../IMPROVEMENTS.md` (repo root) for security and functionality ideas (rate limiting, shared types, error boundaries, etc.).
