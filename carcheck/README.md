# RevVeal — UK Car Check

A UK number plate lookup site. Enter a registration to see vehicle details (make, colour, fuel type, MOT and tax status, ULEZ, road tax, mileage insights, and optional performance specs) from the DVLA Vehicle Enquiry Service and MOT History API.

**Changelog & UI versions:** see [CHANGELOG.md](./CHANGELOG.md) — includes **UI revamp 4.5** (white + orange, current), **UI revamp 4.0** (dark editorial), **UI revamp 3.0** (dark) and **UI revamp 2.0** (light) with git commands to revert.

## Run locally

Use Node.js 24.22.3 or a newer 24.x release (the supported runtime is declared in `package.json`).

```bash
npm install
cp .env.example .env
# Add DVLA/MOT keys and Supabase URL + publishable key (see .env.example)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Accounts (login / register)

- **Register** (`/register`) — email, password (min 10 chars, 1 capital, 1 special), confirm password. Name is optional and can be added later in Settings.
- **Login** (`/login`) — email and password; forgot password sends a Supabase reset email.
- **Dashboard** (`/dashboard`) — My reports, My receipts, Settings (profile, email, password).
- Auth and user data use **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env` or `.env.local`).
- Run `supabase/schema.sql` in the Supabase SQL Editor once to create `profiles` and `vehicle_reports` tables.

## Real vehicle data

The app uses two APIs:

- **DVLA Vehicle Enquiry Service (VES)** — vehicle details (make, colour, tax, MOT status). Set `DVLA_API_KEY` in `.env`.
- **MOT History API** — full MOT test history (pass/fail, advisories, mileage). Base URL: `https://history.mot.api.gov.uk`. Set `MOT_CLIENT_ID`, `MOT_CLIENT_SECRET`, `MOT_API_KEY`, `MOT_TOKEN_URL` (and optionally `MOT_SCOPE_URL`) in `.env`.

1. Copy `.env.example` to `.env` and add your keys (from your DVLA/DVSA approval emails).
2. Restart the dev server. Results appear on `/vehicle/[registration]`.

## Car specs & model lines (local data)

Performance specs (BHP, torque, gearbox, dimensions, etc.) come from a preprocessed **UK-Cars** catalogue. **Model lines** (generation + body family, e.g. A3 Sportback vs Saloon) come from a separate Honest John–style list and narrow matching before trim selection.

### Data files

| File | Role |
|------|------|
| `data/UK-Cars.csv` | Source catalogue (local; not in git). Teoalida / Parkers-style UK specs. |
| `data/make-specs-index.json` | Built specs index (~90 MB). **Required at runtime** for performance lookup. |
| `data/model-lines/source/car-reviews-2026.txt` | Source model-line list (make → model + year ranges). |
| `data/model-lines-index.json` | Built model-line index (~500 KB). **Required at runtime** for generation/body filtering. |

### Preprocess commands

```bash
# 1. UK-Cars CSV → make-specs-index.json (run when UK-Cars.csv changes)
npm run preprocess-uk-cars

# 2. Model-line txt → model-lines-index.json (run when source txt or specs index changes)
npm run preprocess-model-lines
```

**When to regenerate**

| Situation | Command |
|-----------|---------|
| Normal dev / vehicle lookups | Nothing — use existing JSON files. |
| You update `data/UK-Cars.csv` | `npm run preprocess-uk-cars` then `npm run preprocess-model-lines` |
| You edit `data/model-lines/source/car-reviews-2026.txt` | `npm run preprocess-model-lines` |
| Fresh clone without the built JSON files | Both commands (and place `UK-Cars.csv` first). |
| You only change matcher/UI code | No preprocess needed. |

`preprocess-model-lines` attaches **CSV series hints** from `make-specs-index.json`, so run it again after rebuilding the specs index.

Legacy scripts (`preprocess-cars`, `preprocess-specs`) are unused; the active pipeline is `preprocess-uk-cars` + `preprocess-model-lines`.

### Matching flow (summary)

1. DVLA + MOT → make, model, year, fuel, cc, CO₂, etc.
2. **Model lines** — filter by make, MOT model, year, fuel (e.g. drop wrong generation or e-tron for petrol).
3. **UK-Cars index** — fuel → MOT model → year/production window → cc → CO₂ → score → suggested trim.

Transmission and exact trim are still limited when DVLA/MOT do not provide gearbox or derivative data.

## UI versions (quick reference)

| Version | Theme | Revert baseline |
|---------|--------|-----------------|
| **UI 4.5** | White — Auto Trader–style `#ffffff`, original orange `#f59e0b`, editorial hero, PNG header logo | `main` (see CHANGELOG) |
| **UI 4.0 "Garage Atelier"** | Dark editorial — warm ink `#0b0a08`, brass `#c9a35a` accent, hairlines, serif display | `git checkout d23cbe6` |
| **UI 3.0** | Dark — `#0a0a0f` background, elevated cards, amber accents | `git checkout fe634f5` for last UI 3.0 |
| **UI 2.0** | Light — white/slate gradients, Plus Jakarta Sans | `git checkout 052b5b1` for last pushed light UI |

Full feature list and revert commands: [CHANGELOG.md](./CHANGELOG.md).

## Tech

- Next.js 16 (App Router)
- Tailwind CSS v4 (CSS variables in `app/globals.css`)
- TypeScript
- **UI 4.5** — White marketplace theme; original orange accent; Fraunces / Space Grotesk / JetBrains Mono; editorial hero; PNG header logo
- **UI 4.0** — Dark editorial; brass accent, hairline rules, grain texture
- **UI 3.0** — Dark theme, design tokens (`background`, `card`, `surface`, `muted`, amber accent)
- **UI 2.0** — Plus Jakarta Sans, light gradients, elevated white cards
