# UK Car Check

A UK number plate lookup site. Enter a registration to see vehicle details (make, colour, fuel type, MOT and tax status, etc.) from the DVLA Vehicle Enquiry Service.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Real vehicle data

The app uses the official **DVLA Vehicle Enquiry Service (VES)** API. Without an API key it shows demo data so you can try the UI.

1. Apply for a free API key: [register-for-ves.driver-vehicle-licensing.api.gov.uk](https://register-for-ves.driver-vehicle-licensing.api.gov.uk/)
2. Copy `.env.example` to `.env` and set:

   ```
   DVLA_API_KEY=your-api-key
   ```

3. Restart the dev server. Lookups will then use live DVLA data.

## Tech

- Next.js 16 (App Router)
- Tailwind CSS
- TypeScript
