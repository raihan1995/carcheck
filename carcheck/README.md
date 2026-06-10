# RevVeal — UK Car Check

A UK number plate lookup site. Enter a registration to see vehicle details (make, colour, fuel type, MOT and tax status, ULEZ, road tax, mileage insights, and optional performance specs) from the DVLA Vehicle Enquiry Service and MOT History API.

**Changelog & UI versions:** see [CHANGELOG.md](./CHANGELOG.md) — includes **UI revamp 3.0** (dark, current) and **UI revamp 2.0** (light) with git commands to revert.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Real vehicle data

The app uses two APIs:

- **DVLA Vehicle Enquiry Service (VES)** — vehicle details (make, colour, tax, MOT status). Set `DVLA_API_KEY` in `.env`.
- **MOT History API** — full MOT test history (pass/fail, advisories, mileage). Base URL: `https://history.mot.api.gov.uk`. Set `MOT_CLIENT_ID`, `MOT_CLIENT_SECRET`, `MOT_API_KEY`, `MOT_TOKEN_URL` (and optionally `MOT_SCOPE_URL`) in `.env`.

1. Copy `.env.example` to `.env` and add your keys (from your DVLA/DVSA approval emails).
2. Restart the dev server. Results appear on `/vehicle/[registration]`.

## Car specs lookup (optional, beta)

To enrich results with BHP, torque, gearbox, and performance from a Kaggle-style CSV:

1. Place the CSV somewhere (e.g. `C:\Users\Raihan\Downloads\kaggle\all_car_adverts.csv`).
2. Run the preprocess script:
   ```bash
   npm install
   npm run preprocess-cars
   ```
   Or with a custom path: `INPUT_CSV="C:\path\to\all_car_adverts.csv" npm run preprocess-cars`
3. This writes `data/make-specs-index.json` and `data/specs/*.csv`. The vehicle page shows a **Vehicle performance (Beta)** section with a trim dropdown when candidates exist.

## UI versions (quick reference)

| Version | Theme | Revert baseline |
|---------|--------|-----------------|
| **UI 3.0** | Dark — `#0a0a0f` background, elevated cards, amber accents | Current working tree (see CHANGELOG) |
| **UI 2.0** | Light — white/slate gradients, Plus Jakarta Sans | `git checkout 052b5b1` for last pushed light UI |

Full feature list and revert commands: [CHANGELOG.md](./CHANGELOG.md).

## Tech

- Next.js 16 (App Router)
- Tailwind CSS v4 (CSS variables in `app/globals.css`)
- TypeScript
- **UI 3.0** — Dark theme, design tokens (`background`, `card`, `surface`, `muted`, amber accent)
- **UI 2.0** — Plus Jakarta Sans, light gradients, elevated white cards
