# RevVeal — UK vehicle checks

A Next.js application for UK registration lookups. The free check combines available DVLA vehicle and tax information with DVSA MOT history and mileage records. The planned full report costs £5.99 incl. VAT; paid data and checkout are not connected yet.

**App package version: 0.1.0 · UI revamp: 5.1 · Documentation reviewed: 25 November 2026.** The package version and UI generation are separate; the UI revamp does not change the npm package version.

All application source and documentation live in this `carcheck/` subdirectory. From the repository root, run `cd carcheck` before the commands below.

## Current package versions

These are the resolved versions in [package-lock.json](./package-lock.json), checked against the installed packages on 25 November 2026. Version ranges in [package.json](./package.json) may allow newer releases; `npm ci` installs the locked versions.

| Package | Locked version |
| --- | --- |
| `next` | `16.4.6` |
| `react` | `19.3.1` |
| `react-dom` | `19.3.1` |
| `@supabase/ssr` | `0.12.7` |
| `@supabase/supabase-js` | `2.119.2` |
| `tailwindcss` | `4.3.5` |
| `@tailwindcss/postcss` | `4.3.5` |
| `typescript` | `5.9.3` |
| `eslint` | `9.39.3` |
| `eslint-config-next` | `16.4.6` |
| `csv-parse` | `5.6.0` |
| `@types/node` | `24.19.2` |
| `@types/react` | `19.2.14` |
| `@types/react-dom` | `19.2.3` |

The supported Node.js range is `>=24.22.3 <25`. Local verification used Node.js `24.22.3` and npm `11.19.1`; npm is not pinned in the project. Review this table whenever the lockfile changes. Use `npm ls --depth=0` to inspect your local installation.

## Run locally

1. Install a supported Node.js 24.x release and run `npm ci` in this directory.
2. Create `.env.local` from [.env.example](./.env.example) if it does not already exist, then configure the values below.
3. For a new Supabase project, run [supabase/schema.sql](./supabase/schema.sql) in its SQL editor. It creates profiles, owned report snapshots, row-level policies and the new-user profile trigger. Its policy creation statements are not repeatable migrations; review an existing database before applying them again.
4. Configure the Supabase Auth Site URL and redirect allow-list for the app origin and `/auth/callback`, for local and production environments. Enable Google in Supabase if using the Google button; configure email delivery/confirmation for password, recovery and email-link flows.
5. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

On Windows PowerShell, use `npm.cmd` if the npm PowerShell shim is blocked by execution policy.

For a production preview, run `npm run build`, then `npm start`. The session entry point is [proxy.ts](./proxy.ts), using Next.js's `proxy` convention; `lib/supabase/middleware.ts` is its session helper, not a deprecated framework entry file.

## Environment configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Required Supabase project URL. The proxy runs on public pages as well as account routes, so previews also need this configuration. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Required public Supabase key. Do not put a service-role key in a `NEXT_PUBLIC_` variable. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supported legacy fallback. Leave the publishable-key variable **unset**, rather than empty, when using this fallback. |
| `NEXT_PUBLIC_APP_URL` | Canonical app origin for auth callback links, especially in production. In the browser, an unset value falls back to the current origin. |
| `DVLA_API_KEY` | Server-only key for real registration lookups. Not required for the explicit `SAMPLE` record. |
| `MOT_CLIENT_ID`, `MOT_CLIENT_SECRET`, `MOT_TOKEN_URL` | Server-only OAuth client credentials and token endpoint for MOT history. |
| `MOT_API_KEY` | Server-only MOT History API key. |
| `MOT_SCOPE_URL` | Optional OAuth scope; defaults to `https://tapi.dvsa.gov.uk/.default` in the API route. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Confirmed public address for the contact page; the template address is an example. |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Optional analytics website ID. No analytics script is rendered when unset. |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | Optional Umami script URL; defaults to `https://cloud.umami.is/script.js`. |
| `API_CHECK_DEBUG` | Set to `1` only for local diagnosis; leave off in production because responses can include diagnostics and stack traces. The API also recognises `DEBUG=1`. |

Keep local credentials in ignored environment files or the hosting provider's environment settings. `NEXT_PUBLIC_` values are public client configuration. Restart the dev server after environment changes; rebuild production output when public client values change. Live sign-in and provider access still depend on the corresponding external services being configured.

## Design previews

- / — homepage and free registration search.
- /vehicle/SAMPLE — illustrative free report, with MOT timeline and mileage chart.
- /report/SAMPLE — illustrative full report and browser Save as PDF.
- /preview/dashboard — dashboard layout without authentication or private account data.
- /pricing, /faq, /comparison and /guides — supporting pages.

`SAMPLE` never calls DVLA or DVSA, but the public pages still pass through the Supabase session proxy. Vehicle Performance and Misc information are sign-in gated even for the sample.

The current design, route map and source boundaries are documented in [docs/DESIGN.md](./docs/DESIGN.md). Prioritised remaining work and completed improvements are in [IMPROVEMENTS.md](./IMPROVEMENTS.md).

## Application structure

| Location | Responsibility |
| --- | --- |
| `app/` | App Router pages, server handlers and shared UI; the vehicle page renders `app/components/VehicleResults.tsx`. |
| `app/api/check/route.ts` | GET/POST vehicle lookups, provider deadlines and verification before releasing catalogue candidates. |
| `lib/vehicle-types.ts`, `lib/vehicle-summary.ts` | Shared response types and MOT, ULEZ, mileage and CO₂ calculations. |
| `lib/vehicle-tax.ts` | Road-tax estimates and the dated 2026–27 rate tables. |
| `lib/car-specs-lookup.ts`, `lib/model-lines-lookup.ts` | Server-side catalogue matching from the runtime JSON indexes. |
| `lib/supabase/`, `lib/auth/`, `proxy.ts` | Session clients, auth callbacks/redirect validation and dashboard guards. |
| `lib/browser-garage.ts` | Browser-local saved cars, recent checks and reminders. |
| `scripts/`, `data/` | Catalogue preprocessing and committed runtime data. |
| `tests/` | Node test-runner regression suites. |

## Accounts and storage

Supabase handles email/password, Google and email-link authentication, profiles, and existing purchased reports. Configure the auth redirect allow-list to include the app origin and /auth/callback. No paid report can be purchased in this version.

The dashboard includes Home, My cars, Reports, Reminders, Activity, Logbook, Tax alerts and Settings. Saved cars, recent checks and reminder dates use browser-local storage, not account-scoped database rows; different accounts using the same browser share that local garage. They are not synchronised across devices. Reminder dates can be exported to a calendar. Automatic tax/V5C monitoring and message delivery are not connected.

The owned `/report/[id]` route reads a completed Supabase report snapshot, rather than running a fresh lookup. Report sections use `stolen`, `finance`, `writeOff`, `mileage`, `plateChanges` and `valuation`, each with `status` (`clear`, `attention` or `not_checked`), `summary`, `source` and optional `updatedAt`. Unavailable sections are shown as not checked. The current app reads existing owned reports; it does not sell or generate paid reports.

## Vehicle data

- DVLA Vehicle Enquiry Service: set DVLA_API_KEY.
- DVSA MOT History API: set MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_API_KEY, MOT_TOKEN_URL and, if required, MOT_SCOPE_URL.
- Vehicle Performance: requires a signed-in account; catalogue candidates are withheld by the API until the user is verified. data/make-specs-index.json and data/model-lines-index.json are required for matching. Matching is advisory; the exact derivative is not confirmed by a registration lookup.

Both `GET /api/check?registration=…` and `POST /api/check` are supported. POST accepts JSON with `registrationNumber` or the legacy `plate` field. Successful responses include `vehicle`, nullable `motHistory`, `specCandidates`, `suggestedSpecId`, `performanceUnlocked`, `ulezEstimate`, `retrievedAt` and optional `sample`.

The API returns a retrieval timestamp; original source update timestamps are not supplied. MOT and tax status use the provider's status fields. Unavailable MOT or catalogue data does not erase the available DVLA record. Missing DVLA configuration returns `503`; only the explicit `SAMPLE` registration returns illustrative data. Anonymous/invalid sessions receive no catalogue candidates, while the public ULEZ estimate is calculated before the catalogue is withheld.

Successful checks use `Cache-Control: no-store`. DVLA has an 8-second request timeout; the MOT token request and history request each have a 6-second timeout. These are individual deadlines, not a total response-time guarantee. Both methods share the process-local allowance of 30 requests per client-IP key per 60 seconds, returning `429` with `Retry-After` when exhausted. It is not a shared quota across server instances; see the roadmap for the remaining abuse controls.

Road tax and competitor-price comparisons use dated reference values. Review `lib/vehicle-tax.ts` and `app/components/PriceComparison.tsx` when their rates/prices change, and update their check dates. ULEZ remains an estimate with an inline TfL verification link.

## Catalogue preparation

Runtime JSON indexes are committed. Source files are local and ignored by Git.

- data/UK-Cars.csv: source specifications.
- data/model-lines/source/car-reviews-2026.txt: model-line source.
- npm run preprocess-uk-cars: rebuild the specifications index when its CSV changes.
- npm run preprocess-model-lines: rebuild model lines after either source or the specifications index changes.

The older preprocess-cars and preprocess-specs scripts are retained for historical use. Do not regenerate the runtime indexes for ordinary UI changes.

## Checks and documentation maintenance

- `npm test`: 24 regression tests across four test files at this review, covering source statuses, ULEZ precedence, mileage units/dates, redirects, saved-car compatibility, API catalogue access, random hero findings and road-tax boundaries.
- `npm run build`: production build and TypeScript validation; `npm start` serves that output.
- `npm run lint`: ESLint, including legacy components retained in this checkout.

Browser checks cover desktop/mobile layouts, automated accessibility, validation, sample rendering, mocked provider failure/retry, browser-local saves and anonymous route guards. Real sign-in, paid providers and notification delivery require their services and accounts.

When changing packages, update the manifest and lockfile together, verify the resolved versions, rerun appropriate checks and refresh the version table above. `npm audit` and `npm outdated` are available for a separate dependency review; the table records this checkout's versions rather than claiming they are the latest registry releases. Update this README, the [design document](./docs/DESIGN.md), [roadmap](./IMPROVEMENTS.md) and [changelog](./CHANGELOG.md) when the corresponding behaviour changes. Changelog entries for earlier UI generations describe historical behaviour.

## Before publication

Confirm the legal entity, address, VAT details and support/security contacts; review the draft legal pages. Set NEXT_PUBLIC_SUPPORT_EMAIL to a real public contact address. Connect payments, paid data, synchronised storage and notifications before describing them as active services. No fabricated customer reviews, business credentials or partner logos are included.

Historical interface versions are recorded in [CHANGELOG.md](./CHANGELOG.md).
