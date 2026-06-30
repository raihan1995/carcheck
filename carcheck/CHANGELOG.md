# Changelog

Project history for **RevVeal** (UK Car Check). Use this when you need to see what shipped, or to roll back a UI generation.

---

## UI revamp 4.0 — "Garage Atelier" (current)

**Theme:** Dark editorial. Warm ink background, brass/gold accent (replaces flat amber),
hairline rules instead of glassy cards, high-contrast serif display over a grotesk body.
Designed to read like a printed car magazine rather than a generated SaaS template.

**Status:** Local working tree (as of last update).  
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

Features below are cumulative unless noted. They are present in both UI 2.0 (`052b5b1`) and UI 3.0 unless 3.0-only styling is called out.

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
