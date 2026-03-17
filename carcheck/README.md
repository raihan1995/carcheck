# UK Car Check

A UK number plate lookup site. Enter a registration to see vehicle details (make, colour, fuel type, MOT and tax status, etc.) from the DVLA Vehicle Enquiry Service.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Real vehicle data

The app uses two APIs:

- **DVLA Vehicle Enquiry Service (VES)** — vehicle details (make, colour, tax, MOT status). Set `DVLA_API_KEY` in `.env`.
- **MOT History API** — full MOT test history (pass/fail, advisories, mileage). Set `MOT_CLIENT_ID`, `MOT_CLIENT_SECRET`, `MOT_API_KEY`, `MOT_TOKEN_URL` (and optionally `MOT_SCOPE_URL`) in `.env`.

1. Copy `.env.example` to `.env` and add your keys (from your DVLA/DVSA approval emails).
2. Restart the dev server. Results appear on `/vehicle/[registration]`.

## Car specs lookup (optional)

To enrich results with BHP, transmission, and road tax from a Kaggle-style CSV (e.g. UK car adverts):

1. Place the CSV somewhere (e.g. `C:\Users\Raihan\Downloads\kaggle\all_car_adverts.csv`).
2. Install deps and run the preprocess script:
   ```bash
   npm install
   npm run preprocess-cars
   ```
   Or with a custom path: `INPUT_CSV="C:\path\to\all_car_adverts.csv" npm run preprocess-cars`
3. This writes `data/car-specs-lookup.json` (keyed by make|model|year|engine_vol|fuel). Use it in your API or server code to look up specs from DVLA make/model/year/engine/fuel.

## Tech

- Next.js 16 (App Router)
- Tailwind CSS
- TypeScript
- **UI v2** — Plus Jakarta Sans, gradient backgrounds, elevated cards, amber accents
