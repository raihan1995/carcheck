# RevVeal — UK vehicle checks

A Next.js application for UK registration lookups. The free check combines available DVLA vehicle and tax information with DVSA MOT history and mileage records. The planned full report costs £5.99 incl. VAT; paid data and checkout are not connected yet.

## Run locally

Use Node.js 24.22.3 or a newer 24.x release.

1. Run npm ci in this directory.
2. Copy .env.example to .env.local and configure DVLA, MOT and Supabase values.
3. Run the schema in supabase/schema.sql in your Supabase project if the account tables are not already set up.
4. Run npm run dev and open http://localhost:3000.

On Windows PowerShell, npm.cmd can be used if the npm PowerShell shim is blocked by execution policy.

## Design previews

- / — homepage and free registration search.
- /vehicle/SAMPLE — illustrative free report, with MOT timeline and mileage chart.
- /report/SAMPLE — illustrative full report and browser Save as PDF.
- /preview/dashboard — dashboard layout without authentication or private account data.
- /pricing, /faq, /comparison and /guides — supporting pages.

The design system, route map, source boundaries and remaining content are documented in [docs/DESIGN.md](./docs/DESIGN.md).

## Accounts and storage

Supabase handles email/password, Google and email-link authentication, profiles, and existing purchased reports. Configure the auth redirect allow-list to include the app origin and /auth/callback. No paid report can be purchased in this version.

The dashboard includes Home, My cars, Reports, Reminders, Activity, Logbook, Tax alerts and Settings. Saved cars, recent checks and reminder dates are explicitly browser-local; they are not synchronised across accounts or devices. Reminder dates can be exported to a calendar. Automatic tax/V5C monitoring and message delivery are not connected.

The owned /report/[id] route reads a completed Supabase report snapshot, rather than running a fresh lookup. Report sections accept status (clear, attention or not_checked), summary, source and updatedAt. Unavailable sections are shown as not checked.

## Vehicle data

- DVLA Vehicle Enquiry Service: set DVLA_API_KEY.
- DVSA MOT History API: set MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_API_KEY, MOT_TOKEN_URL and, if required, MOT_SCOPE_URL.
- Vehicle Performance: requires a signed-in account; catalogue candidates are withheld by the API until the user is verified. data/make-specs-index.json and data/model-lines-index.json are required for matching. Matching is advisory; the exact derivative is not confirmed by a registration lookup.

The API returns a retrieval timestamp; original source update timestamps are not supplied. MOT and tax status use the provider's status fields. Unavailable MOT or catalogue data does not erase the available DVLA record. Missing DVLA configuration returns an unavailable response; only the explicit SAMPLE registration returns illustrative data.

## Catalogue preparation

Runtime JSON indexes are committed. Source files are local and ignored by Git.

- data/UK-Cars.csv: source specifications.
- data/model-lines/source/car-reviews-2026.txt: model-line source.
- npm run preprocess-uk-cars: rebuild the specifications index when its CSV changes.
- npm run preprocess-model-lines: rebuild model lines after either source or the specifications index changes.

The older preprocess-cars and preprocess-specs scripts are retained for historical use. Do not regenerate the runtime indexes for ordinary UI changes.

## Checks

- npm test: regression cases for source statuses, hybrid emissions classification, mileage units/date parsing and safe auth redirects.
- npm run build: production build and TypeScript validation.
- npm run lint: ESLint, including legacy components retained in this checkout.

Browser checks cover desktop/mobile layouts, automated accessibility, validation, sample rendering, mocked provider failure/retry, browser-local saves and anonymous route guards. Real sign-in, paid providers and notification delivery require their services and accounts.

## Before publication

Confirm the legal entity, address, VAT details and support/security contacts; review the draft legal pages. Set NEXT_PUBLIC_SUPPORT_EMAIL to a real public contact address. Connect payments, paid data, synchronised storage and notifications before describing them as active services. No fabricated customer reviews, business credentials or partner logos are included.

Historical interface versions are recorded in [CHANGELOG.md](./CHANGELOG.md).
